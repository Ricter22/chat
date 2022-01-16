
function check(){
    fetch('http://localhost:3000/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: document.getElementById('usernameInput').value,
                password: document.getElementById('passInput').value
              }),
            }) //here we handle the status response of the server
              .then(r =>  r.json().then(data => ({status: r.status, body: data})))
              .then(obj => {
                //console.log(obj.status);
                if (obj.status == 200) {
                  alert('Login succesful')
                  sessionStorage.setItem('user', document.getElementById('usernameInput').value);
                  window.location.href = "/homePage.html";
                }
                else if(obj.status == 422){
                    document.getElementById('usernameInput').value = '';
                    document.getElementById('passInput').value = '';
                    alert('Unsuccesful');
                  }
              });
}


