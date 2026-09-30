import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { buildEstimateDoc } from "@/lib/estimate-model";
import { prisma } from "@/lib/prisma";
import { EstimateDocument } from "@/pdf/EstimateDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function contentDisposition(fileName: string): string {
  const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;

  let orderId: bigint;
  try {
    orderId = BigInt(id);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ hidden: false }, { hidden: null }],
    },
    select: {
      orderNumber: true,
      clientName: true,
      userName: true,
      dates: true,
      createdAt: true,
      deliveryMethod: true,
      promoCode: true,
      promoRejected: true,
      promoDiscountPercent: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          productName: true,
          category: true,
          quantity: true,
          pricePerDay: true,
          daysCount: true,
          totalPrice: true,
        },
      },
    },
  });

  if (!order) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = buildEstimateDoc(order);
  const buffer = await renderToBuffer(<EstimateDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(data.fileName),
      "Cache-Control": "no-store",
    },
  });
}
