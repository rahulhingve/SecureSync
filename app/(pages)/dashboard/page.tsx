import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Dashboard from "@/components/Dashboard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function  Home  ()  {

const session = await getServerSession(authOptions)

if(!session){
  redirect("/login")
}

  return (
    <>
    
    <Dashboard/>
    </>
  );
}
