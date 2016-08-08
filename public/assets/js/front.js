/**
 * Created by bface007 on 24/07/2016.
 */
(function ( d, w ) {
    var signinForm = d.querySelector( "#signin-form" ),
        resetBtn = d.querySelector( "#reset-form" ),
        usernameInput = signinForm.querySelector( "#username" ),
        passwordInput = signinForm.querySelector( "#password" ),
        confirmInput = signinForm.querySelector( "#confirmed" ),
        csrfInput = signinForm.querySelector( '#_csrf' ),
        submitBtn = signinForm.querySelector( "#submit-button" ),
        submitBtnSpinner = submitBtn.querySelector( ".mdl-spinner" ),
        pageLoader = new w.PageLoader(),
        Toast = w.Toast,
        usernameInputValue,
        passwordInputValue,
        confirmInputValue,
        request = w.superagent;

    usernameInput.focus();
    submitBtn.disabled = false;

    resetBtn.onclick = function () {
        usernameInput.value = "";
        passwordInput.value = "";

        if( confirmInput )
            confirmInput.value = "";

        usernameInput.focus();
    };

    signinForm.addEventListener( 'submit', function () {
        usernameInputValue = usernameInput.value.trim();
        passwordInputValue = passwordInput.value.trim();
        if( confirmInput )
            confirmInputValue = confirmInput.value.trim();

        if( confirmInput && passwordInputValue != confirmInputValue ) {
            new Toast()
                .warning( "Le mot de passe et la confirmation ne correspondent pas.", null, null, 6000)
                    .show();

            showErrorBelowInput( passwordInput, "Le mot de passe et la confirmation ne correspondent pas." );
            showErrorBelowInput( confirmInput, "Le mot de passe et la confirmation ne correspondent pas." );
            return;
        }


        pageLoader.showPageLoader();
        submitBtn.disabled = true;
        resetBtn.disabled = true;
        submitBtnSpinner.classList.remove( "hide-opacity" );

        var sended = { username : usernameInputValue, password : passwordInputValue, _csrf : csrfInput.value };

        if( confirmInput )
            sended.confirmed = confirmInputValue;

        request
            .post( signinForm.getAttribute( 'action' ) )
                .send( sended )
                .end( function ( err, res ) {
                    console.log("err ", err);
                    console.log( res );

                    if( err ) {
                        if( res && res.statusCode == 403 ) {
                            new Toast()
                                .error( "Une erreur s'est produite. La page se rechargera dans 5s...", null, null, 10000 )
                                    .show();
                            setTimeout( function () {
                                // Reload the current page, without using the cache
                                d.location.reload( true );
                            }, 5000 );

                            return;
                        }
                        new Toast()
                            .error( "Une erreur s'est produite.", null, null, 5000 )
                                .show();
                        console.log( err );
                        // return;
                    }

                    try {
                        var response = res.body;

                        if( response.success )
                            w.location.href = "/dashboard";
                        else {
                            switch ( response.input ) {
                                case 'username':
                                    showErrorBelowInput( usernameInput, response.message );
                                    break;
                                case 'password+confirm':
                                    showErrorBelowInput( passwordInput, response.message );
                                    showErrorBelowInput( confirmInput, response.message );
                                    break;
                                case 'password':
                                    showErrorBelowInput( passwordInput, response.message );
                                    break;
                            }

                            var newCSRFToken = res.header['X-CSRF-TOKEN'];

                            if( newCSRFToken )
                                csrfInput.value = newCSRFToken;
                        }
                    } catch ( e ) {
                        console.log( e );
                    }



                    pageLoader.hidePageLoader();
                    submitBtn.disabled = false;
                    resetBtn.disabled = false;
                    submitBtnSpinner.classList.add( "hide-opacity" );
                } );
    } );

    function showErrorBelowInput( input, errorMessage ) {
        if ( input.parentElement){
            input.parentElement.classList.add( "is-invalid" );
            input.parentElement.querySelector( ".mdl-textfield__error" ).innerHTML = errorMessage;
        }
    }

})( document, window );