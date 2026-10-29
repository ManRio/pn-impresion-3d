"use client";
import { useState } from "react";
import { saveAndPublish } from "./save-and-publish";
export default function SaveAndPublish({id}:{id:string}){
 const [busy,setBusy]=useState(false);
 async function handle(){
  if(busy)return;
  const general=document.querySelector<HTMLFormElement>('form[data-product-general="true"]');
  if(!general||!general.reportValidity())return;
  const data=new FormData(general);data.set("productId",id);
  const variants=Array.from(document.querySelectorAll<HTMLFormElement>('form[data-product-variant="true"]'));
  for(const f of variants){if(!f.reportValidity())return;const v=new FormData(f);const vid=String(v.get("variantId")||"");if(!vid)return;for(const key of ["label","color","material","weightGrams","priceCents","productionMins"]){data.set(`variant.${vid}.${key}`,String(v.get(key)||""))}data.set(`variant.${vid}.active`,v.has("active")?"on":"off");data.append("variantIds",vid)}
  if(!window.confirm("¿Guardar todos los cambios de la ficha y publicar este producto?"))return;
  setBusy(true);try{await saveAndPublish(data)}finally{setBusy(false)}
 }
 return <button type="button" disabled={busy} onClick={handle} className="rounded-lg bg-[#B5FF67] px-5 py-3 font-bold text-[#101319] disabled:opacity-50">{busy?"Guardando y publicando…":"Guardar todo y publicar"}</button>
}
