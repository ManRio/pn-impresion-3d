"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export default function ProfileLogout(){
  const router=useRouter();
  return <button type="button" onClick={async()=>{await authClient.signOut();router.replace("/");router.refresh();}} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:border-[#B5FF67]">Cerrar sesión</button>;
}
