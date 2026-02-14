// function login(){
//     const username=document.getElementById("username").value;
//     const password=document.getElementById("password").value;
//     const error=document.getElementById("error");

//     //hardcoded admin credentials

//     if(username === "admin"  && password === "admin123"){
//         localStorage.setItem("isAdminLoggedIn","true");
//         window.location.href ="./admin.html";
//     }else{
//         error.textContent="Invalid Credentials";
//     }


// }



async function login(){
    const username=document.getElementById("username").value;
    const password=document.getElementById("password").value;

    const error=document.getElementById("error");


    const res =await fetch("https://cafe-backend-yy7e.onrender.com/login",{
        method:"POST",
        headers: {"content-Type":"application/json"},
        body:JSON.stringify({
            username:username,
            password:password
        })
    });


    const data= await  res.json();

    if(!res.ok){
        error.textContent=data.message;
        return;
    }


    localStorage.setItem("adminToken",data.token);
    window.location.href="./admin.html";

}

