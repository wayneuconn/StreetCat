import { GuestShell } from "@/components/layout/guest-shell";
import { CartCheckout } from "@/components/order/cart-checkout";

export default function OrderPage() {
  return (
    <GuestShell>
      <CartCheckout />
    </GuestShell>
  );
}
