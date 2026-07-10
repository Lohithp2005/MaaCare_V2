import { toast } from 'react-toastify';


interface LoginData {
        email:string,
        password:string
    }
export const handleLogIn = async (loginData: LoginData) => {
     try {
            const response = await fetch("http://localhost:8000/user/login",{
                method:"POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body:JSON.stringify(loginData)
    
            }) 
    
            const data = await response.json();
              if(!response.ok) {
                toast.error(data.detail,{
                    "position": "top-center",
                    "autoClose": 2000,
                })  
            }
            if(response.ok){
                toast.success(data.message, {
                    position: "top-center",
                    autoClose: 1000,
                });
            }
    
            return data;
        } catch (error) {   
            toast.error("Error occurred during login. Please try again.", {
                position: "top-center",
                autoClose: 2000,
            });
        }
}

export const handleLogOut = async () => {
        try {
      const response = await fetch("http://localhost:8000/user/logout",{
        "method":"post",
        "credentials": "include",
      })

      if(response.ok){
    
      toast.success("Logout successful", {
        position: "top-center",
        autoClose: 1000,
      });
      return true;
     
    }
    } catch (error) {
      toast.error("Error occurred during logout. Please try again.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
}

