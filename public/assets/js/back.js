/**
 * Created by bface007 on 24/07/2016.
 */
( function ( d, w, m ) {
    'use strict';

    var submitBox = d.querySelector( "#submit-box" ),
        messageInput = submitBox.querySelector( "#message-input" ),
        submitBtn = submitBox.querySelector( "#submit-button" ),
        messagesList = d.querySelector( "#message-list" ),
        request = w.superagent,
        currentMessage = [];

    var socket = io();

    messageInput.focus();

    socket.on( "new message", function ( data ) {
        var el = messagesList.querySelector( "#message_" + data._id );

        if( ! el ) {
            addTodayTimeDividerIfNeeded( messagesList );

            var li = d.createElement( "li" ),
                mBoxWrapper = d.createElement( "div" ),
                avatarWrapper = d.createElement( "div" ),
                avatar = d.createElement( "img" ),
                mBox = d.createElement( "div" ),
                usernameBox = d.createElement( "span" ),
                metaBox = d.createElement( "span" ),
                mBody = d.createElement( "div" );

            mBoxWrapper.classList.add( "message-box-wrapper" );
            avatarWrapper.classList.add( "message-sender-avatar" );
            mBox.classList.add( "message-box" );
            mBox.classList.add( "mdl-shadow--2dp" );
            usernameBox.classList.add( "message-sender-username" );
            metaBox.classList.add( "message-meta" );
            mBody.classList.add( "message-body" );

            messagesList.insertBefore( li, messagesList.firstChild );
            li.appendChild( mBoxWrapper );
            mBoxWrapper.appendChild( avatarWrapper );
            avatarWrapper.appendChild( avatar );
            mBoxWrapper.appendChild( mBox );
            mBox.appendChild( usernameBox );
            mBox.appendChild( metaBox );
            mBox.appendChild( mBody );

            avatar.setAttribute( 'src', data.__author.avatar || submitBox.getAttribute( "data-avatar" ) );
            usernameBox.innerHTML = data.__author.username;
            mBody.innerHTML = data.content;
            metaBox.innerHTML = m( data.created ).format( "HH:mm" )
        }
    } );

    messageInput.onkeyup = function ( e ) {

        this.innerHTML.length > 0 ? submitBtn.disabled = false : submitBtn.disabled = true;
        if( e.which && e.which == 13 || e.key && e.key == "Enter" ) {
            if( messageInput.innerText.trim() == "" ){
                messageInput.innerHTML = "";
                messageInput.focus();
                return;
            }

            var data = getData( submitBox );

            currentMessage = addMessage( messagesList, data, true );
            submitBox.classList.add( "loading" );
            messageInput.setAttribute( 'contenteditable', false );
            // setLoadingButtonState( submitBtn );
            currentMessage[0].classList.add( "loading" );
            messageInput.innerHTML = "";
            submitBtn.disabled = true;

            sendData( data, sendDateCallback )
        }
        if( this.innerHTML.length >= 200 )
            alert( "La limite est de 200 caractères" );

    };
    messageInput.onkeydown = function ( e ) {

        if( this.innerHTML.length >= 200 && ( ( e.which && e.which != 8 || e.which && e.which != 13 ) || ( e.key && e.key != "Enter" || e.key && e.key != "Backspace" ) ))
            return false;
        if( ( e.which && e.which == 13 || e.key && e.key == "Enter" ) && submitBtn.disabled == true )
            return false;
    };
    submitBtn.onclick = function () {
        if( messageInput.innerHTML.trim() == "" )
            return;

        var data = getData( submitBox );

        currentMessage = addMessage( messagesList, data, true );
        submitBox.classList.add( "loading" );
        messageInput.setAttribute( 'contenteditable', false );
        // setLoadingButtonState( submitBtn );
        currentMessage[0].classList.add( "loading" );
        messageInput.innerHTML = "";
        submitBtn.disabled = true;

        sendData( data, sendDateCallback )
    };
    
    function addMessage( messagesList, data, right ) {
        
        addTodayTimeDividerIfNeeded( messagesList );

        right = right || false;

        var li = d.createElement( "li" ),
            mBoxWrapper = d.createElement( "div" ),
            avatarWrapper = d.createElement( "div" ),
            avatar = d.createElement( "img" ),
            mBox = d.createElement( "div" ),
            usernameBox = d.createElement( "span" ),
            metaBox = d.createElement( "span" ),
            mBody = d.createElement( "div" );

        li.classList.add( "message" );
        if( right )
            li.classList.add( "right" );
        mBoxWrapper.classList.add( "message-box-wrapper" );
        avatarWrapper.classList.add( "message-sender-avatar" );
        mBox.classList.add( "message-box" );
        mBox.classList.add( "mdl-shadow--2dp" );
        usernameBox.classList.add( "message-sender-username" );
        metaBox.classList.add( "message-meta" );
        mBody.classList.add( "message-body" );

        messagesList.insertBefore( li, messagesList.firstChild );
        li.appendChild( mBoxWrapper );
        mBoxWrapper.appendChild( avatarWrapper );
        avatarWrapper.appendChild( avatar );
        mBoxWrapper.appendChild( mBox );
        mBox.appendChild( usernameBox );
        mBox.appendChild( metaBox );
        mBox.appendChild( mBody );

        avatar.setAttribute( 'src', data.avatar );
        usernameBox.innerHTML = data.username;
        mBody.innerHTML = data.content;

        return [ li, data ];
    }



    function getData( submitBox ) {
        return {
            content : messageInput.innerText,
            username : submitBox.getAttribute( "data-username" ),
            avatar : submitBox.getAttribute( "data-avatar" ),
            _csrf  : submitBox.getAttribute( "data-csrfToken" )
        };
    }

    function setLoadingButtonState ( button ) {
        button.innerHTML = '<i class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></i>';
    }

    function setNormalButtonState( button ) {
        button.innerHTML = '<i class="material-icons">send</i>';
    }

    function sendData ( data , callback) {
        request
            .post( '/dashboard/messages' )
                .send( data )
                .end( callback );
    }

    function sendDateCallback( err, res ) {
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
            currentMessage[0].classList.add( "error" );
            // return;
        }

        try {
            var response = res.body,
                message = response.data;

            if( response.success ){
                currentMessage[0].setAttribute( "id", "message_"+ message._id );
                currentMessage[0].querySelector( ".message-meta" ).innerHTML = response.created;

                socket.emit( 'have sent new message', { message: message } );
            }
        } catch ( e ) {
            console.log( e );
        }
        submitBox.classList.remove( "loading" );
        messageInput.setAttribute( 'contenteditable', true );
        currentMessage[0].classList.remove( "loading" );
        // currentMessage = [];
        messageInput.focus()
    }

    function addTodayTimeDividerIfNeeded( messagesList ) {
        if( ! messagesList.querySelector( "#today" ) ){
            var li = d.createElement( "li" ),
                content = d.createElement( "span" );
            li.setAttribute( "id", "today" );
            li.classList.add( "time-divider" );
            content.classList.add( "mdl-shadow--1dp" );

            messagesList.appendChild( li );
            li.appendChild( content );

            content.innerHTML = "Aujourd'hui";
        }
    }
    
} )( document, window, moment );