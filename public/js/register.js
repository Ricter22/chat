const socket = io();

const image = document.getElementById('profile-pic');

image.addEventListener('change', (e)=>{
    const file = image;
    console.log(file);
    let bin = {
        binary: ''
    };
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e){
        console.log(reader.result);
        bin.binary = reader.result;
        socket.emit('profilePic', bin);
    }
})