import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import LoginPage from '@/components/Login'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation';
import React from 'react'




const page = async  () => {

const session = await getServerSession(authOptions);

if(session){
console.log("logged in redirecting to dashboard ")
  redirect("/dashboard")

}

  return (
    <LoginPage/>
  )
}

export default page