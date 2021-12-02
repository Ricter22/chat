<img src="/public/images/chaticon.ico"/>

**_Melo Chat Server_** is a real time message-delivery application with socket connections.
We are a **Node.js** based application that helps you get in touch with your contacts
in a very easy and fast way. At the moment, we can run on all browsers and we offer
a set of different functionalities:

  - Global chat.
  - Rooms chats.
  - Private chats: if you want to chat with a determined user in the user list you just
    have to click the username and the user will receive a notification. When the user
    accepts the request, a private room with only both users will be created to chat.

In order to be compliant with a fast communication in real time we have decided to 
use **Socket.io**, a library that enables Client-Server communication: https://socket.io/docs/v4/

This library is very useful along with the Node.js environment because of the number
of events sent in a very short time space. 

We also have used **Express** for a better performance: https://expressjs.com/es/api.html

And finally, we have also made use of the **Moment** library so that the messages can
be displayed with a well formatted timestamp: https://momentjs.com/docs/

**_We have updated our application_** and now you will be able to use it with **Docker**.
You will download a _Dockerfile_ and _docker-compose.yaml_ file. With these files now the 
application is run with: *docker compose up -d*.
There have been a lot of changes, now:

  - We use a Mongoose database to store messages so you can access old communications.
    For that, we have created a register form for you to have your own user profile (with
    your own profile picture, which will apear now on in the user list next to your username).
  - Your data is in good hands. We use the bcrypt library to encrypt your password when
    sending it to the database.
  - If a country (in a short list) is in the message between @'s we parse it and a link to 
    the Wikipedia page of the country will replace the original word. E.g.: _I was in @Brasil@
    last week!_ -> _I was in https://en.wikipedia.org/wiki/Brasil last week!_ .

In case you still have any doubts we have our **Component, Sequence and Deployment diagrams** 
too:

<img src="/public/images/MCS Component Diagram.jpg"/>
<img src="/public/images/MCS Sequence Diagram.jpg"/>
<img src="/public/images/MCS Deployment Diagram.jpg"/>

--Riccardo Terrenzi and Juan Emilio Ordóñez Márquez
