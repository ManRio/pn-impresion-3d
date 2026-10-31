"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const get = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export async function saveCustomerProfile(form: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/mi-cuenta/acceso");
  const name = get(form,"name");
  if (name.length < 2 || name.length > 120) redirect("/mi-cuenta?error=Nombre%20no%20valido");
  const payload = {
    firstName: get(form,"firstName"), lastName: get(form,"lastName"),
    phone: get(form,"phone"), shippingAddress: get(form,"shippingAddress"),
    shippingPostalCode: get(form,"shippingPostalCode"), shippingCity: get(form,"shippingCity"),
    shippingProvince: get(form,"shippingProvince"), shippingCountry: get(form,"shippingCountry"),
    billingAddress: get(form,"billingAddress"), billingPostalCode: get(form,"billingPostalCode"),
    billingCity: get(form,"billingCity"), billingProvince: get(form,"billingProvince"),
    billingCountry: get(form,"billingCountry"), taxId: get(form,"taxId"),
  };
  if (Object.values(payload).some(v=>v.length>250)) redirect("/mi-cuenta?error=Campo%20demasiado%20largo");
  await prisma.$transaction([
    prisma.user.update({where:{id:session.user.id},data:{name}}),
    prisma.customerProfile.upsert({
      where:{userId:session.user.id},
      create:{userId:session.user.id,...payload},
      update:payload,
    }),
  ]);
  revalidatePath("/mi-cuenta");
  redirect("/mi-cuenta?ok=1");
}
