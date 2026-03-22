'use server'

import { stripe } from '@/lib/stripe'
import { SERVICES } from '@/lib/products'

export async function startCheckoutSession(productIds: string | string[]) {
  const ids = Array.isArray(productIds) ? productIds : [productIds]
  
  const lineItems = ids.map((productId) => {
    const product = SERVICES.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product with id "${productId}" not found`)
    }
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity: 1,
    }
  })

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: lineItems,
    mode: 'payment',
  })

  return session.client_secret
}
