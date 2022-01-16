function check(){
    fetch('http://localhost:8080/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('psw').value
              }),
            }) //here we handle the status response of the server
              .then(r =>  r.json().then(data => ({status: r.status, body: data})))
              .then(obj => {
                //console.log(obj.status);
                if (obj.status == 200) {
                  alert('Registration succesful')
                  window.location.href = "/login.html";
                }
                else if(obj.status == 422){
                    document.getElementById('username').value = '';
                    document.getElementById('psw').value = '';
                    document.getElementById('psw-repeat').value = '';
                    alert('Unsuccesful');
                  }
              });
}