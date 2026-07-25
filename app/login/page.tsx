'use client'

import { useRouter } from "next/navigation"



const LoginPage = () => {
    const router =useRouter();
    const handleSubmit=()=>{
        router.push("/dashboard")
    } 
     return (
    <div>
        <button className="btn btn-primary" onClick={handleSubmit}>
            login
        </button>
    </div>
  )
}

export default LoginPage
