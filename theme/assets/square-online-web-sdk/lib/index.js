var te = Object.defineProperty;
var re = (i, e, t) => e in i ? te(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var p = (i, e, t) => (re(i, typeof e != "symbol" ? e + "" : e, t), t), F = (i, e, t) => {
  if (!e.has(i))
    throw TypeError("Cannot " + t);
};
var j = (i, e, t) => (F(i, e, "read from private field"), t ? t.call(i) : e.get(i)), T = (i, e, t) => {
  if (e.has(i))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(i) : e.set(i, t);
}, G = (i, e, t, r) => (F(i, e, "write to private field"), r ? r.call(i, t) : e.set(i, t), t);
var _ = (i, e, t) => (F(i, e, "access private method"), t);
const X = {
  SHIPMENT: "SHIPMENT",
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
  MANUAL: "MANUAL"
}, x = {
  ASAP: "ASAP",
  SCHEDULED: "SCHEDULED"
}, H = {
  CHOICE: "CHOICE",
  TEXT: "TEXT",
  GIFT_WRAP: "GIFT_WRAP",
  GIFT_MESSAGE: "GIFT_MESSAGE"
}, ie = () => {
  var i;
  return (i = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : i.content;
}, E = () => ({
  Accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "X-CSRF-TOKEN": ie()
}), N = (i) => {
  const e = i + "=", r = decodeURIComponent(document.cookie).split(";");
  for (let o = 0; o < r.length; o++) {
    let n = r[o];
    for (; n.charAt(0) == " "; )
      n = n.substring(1);
    if (n.indexOf(e) == 0)
      return n.substring(e.length, n.length);
  }
  return null;
}, C = "/s/api/v1/cart", K = "Something went wrong", V = (i, e) => {
  const t = U(e.error || e.message || i.statusText), r = new Error(t);
  if (e.errors) {
    const o = {};
    Object.keys(e.errors).forEach((n) => {
      const s = e.errors[n].map((a) => U(a));
      o[U(n)] = s;
    }), r.errors = o;
  }
  return e.fields && (r.fields = e.fields), i.status && (r.status = i.status, r.status === 200 && (r.status = 500)), r;
}, k = async (i) => {
  const e = await i.json();
  if (!i.ok)
    throw V(i, e);
  return {
    response: i,
    data: e.data
  };
}, ne = async (i) => {
  var e;
  if (i.redirected) {
    if (window.location.href === i.url) {
      const t = await i.json();
      throw (e = t == null ? void 0 : t.response) != null && e.errors ? V(i, t.response.errors) : new Error(K);
    }
    window.location.href = i.url;
    return;
  } else if (!i.ok) {
    const t = await i.json();
    throw V(i, t);
  }
  throw new Error(K);
}, U = (i) => i.replace(/[_][a-z0-9]/g, (e) => e.toUpperCase().replace("_", "")), L = (i) => i.replace(/[A-Z0-9]/g, (e) => `_${e.toLowerCase()}`), D = (i) => {
  const e = {};
  return Object.keys(i).forEach((t) => {
    const r = i[t];
    Array.isArray(r) ? e[L(t)] = W(r) : r && typeof r == "object" ? e[L(t)] = D(r) : e[L(t)] = r;
  }), e;
}, W = (i) => {
  const e = [];
  return i.forEach((t) => {
    Array.isArray(t) ? e.push(W(t)) : t && typeof t == "object" ? e.push(D(t)) : e.push(t);
  }), e;
}, oe = (i) => {
  const e = q(i);
  return delete e.order_id, e;
}, z = (i) => {
  const e = JSON.parse(JSON.stringify(i));
  return e.fulfillmentType === X.PICKUP ? (e.pickupDetails || (e.pickupDetails = {}), e.pickupDetails.scheduleType || (e.pickupDetails.scheduleType = x.ASAP), e.pickupDetails.curbsidePickupRequested == null && (e.pickupDetails.curbsidePickupRequested = !1), e.pickupDetails.curbsidePickupDetails || (e.pickupDetails.curbsidePickupDetails = {
    curbsideDetails: ""
  })) : e.fulfillmentType === X.DELIVERY && e.deliveryDetails && (e.deliveryDetails.noContactDelivery == null && (e.deliveryDetails.noContactDelivery = !1), e.deliveryDetails.scheduleType || (e.deliveryDetails.scheduleType = x.ASAP)), e;
}, q = (i) => {
  var o;
  const e = JSON.parse(JSON.stringify(i.lineItem));
  e.quantity || (e.quantity = 1);
  const t = D(e);
  if ((o = t.modifiers) != null && o.length) {
    const n = {};
    t.modifiers.forEach((s) => {
      if (s.type) {
        n[s.type] || (n[s.type] = {});
        const a = JSON.parse(JSON.stringify(s));
        delete a.id, delete a.type, n[s.type][s.id] = a;
      }
    }), t.modifiers = n;
  } else
    t.modifiers && delete t.modifiers;
  return {
    line_item: t,
    fulfillment: D(z(i.fulfillment)),
    location_id: i.locationId,
    // JSON.stringify will remove if undefined
    order_id: b(i)
  };
}, b = (i) => i.orderId !== void 0 ? i.orderId : N("com_cart_id") || void 0;
class se {
  /**
      * Retrieves the active cart id if it exists.
      *
      * ```ts
      * 	const cartId = sdk.cart.getActiveId();
      * ```
      */
  getActiveId() {
    return N("com_cart_id") || void 0;
  }
  /**
      * Adds an item to your cart order.
      *
      * ```ts
      *	const addItemRequest = {
      *		lineItem: {
      *			itemId: '47HCEE6ZQUFFY3Y7X52CRVCO',
      *			variationId: '6YOTMYGOFTJR4PTTYRCLE7BH',
      *			quantity: 1,
      *			modifiers: [
      *				{
      *					id: '6WVGAE3PKEHRWZHF54KR2PIN',
      *					type: 'CHOICE',
      *					choiceSelections: ['E3MWZ3PJ3VZDQWGW4G3KFZGW', 'GKCUYTB7ARN25J7BTRTOSVHO']
      *				},
      *				{
      *					id: '11ede91fbff63a3ab4dbde667deefb9b',
      *					type: 'TEXT',
      *					textEntry: 'my t-shirt-text'
      *				},
      *				{
      *					id: '11ee185ca1cd3e98a25c9e3d692ffefb',
      *					type: 'GIFT_WRAP',
      *					choiceSelections: ['11ee185ca1cd7daebd029e3d692ffefb']
      *				},
      *				{
      *					id: '11ee185ca17973e490449e3d692ffefb',
      *					type: 'GIFT_MESSAGE',
      *					textEntry: 'happy bday'
      *				}
      *			]
      *		},
      *		fulfillment: {
      *			fulfillmentType: 'SHIPMENT'
      *		},
      *		locationId: 'L36RW9ABXQTEE'
      *	};
      *	try {
      *		const response = await sdk.cart.addItem(addItemRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async addItem(e) {
    const t = q(e), r = await fetch(`${C}/add`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: E()
    });
    return await k(r);
  }
  /**
      * Adds an item to a new order and redirects to checkout on success.
      *
      * ```ts
      *	const buyNowItemRequest = {
      *		lineItem: {
      *			itemId: '47HCEE6ZQUFFY3Y7X52CRVCO',
      *			variationId: '6YOTMYGOFTJR4PTTYRCLE7BH',
      *			quantity: 1,
      *			modifiers: [
      *				{
      *					id: '6WVGAE3PKEHRWZHF54KR2PIN',
      *					type: 'CHOICE',
      *					choiceSelections: ['E3MWZ3PJ3VZDQWGW4G3KFZGW', 'GKCUYTB7ARN25J7BTRTOSVHO']
      *				},
      *				{
      *					id: '11ede91fbff63a3ab4dbde667deefb9b',
      *					type: 'TEXT',
      *					textEntry: 'my t-shirt-text'
      *				},
      *				{
      *					id: '11ee185ca1cd3e98a25c9e3d692ffefb',
      *					type: 'GIFT_WRAP',
      *					choiceSelections: ['11ee185ca1cd7daebd029e3d692ffefb']
      *				},
      *				{
      *					id: '11ee185ca17973e490449e3d692ffefb',
      *					type: 'GIFT_MESSAGE',
      *					textEntry: 'happy bday'
      *				}
      *			]
      *		},
      *		fulfillment: {
      *			fulfillmentType: 'SHIPMENT'
      *		},
      *		locationId: 'L36RW9ABXQTEE'
      *	};
      *	try {
      *		await sdk.cart.buyNowItem(buyNowItemRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async buyNowItem(e) {
    const t = oe(e), r = await fetch(`${C}/buy`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: E()
    });
    return ne(r);
  }
  /**
      * Updates the quantity of an item on an order. Quantity must be greater than 0.
      *
      * ```ts
      *	const updateItemQuantityRequest = {
      *		orderItemId: '11ee2722e42886d182fa089e019fd17a',
      *		quantity: 2
      *	};
      *	try {
      *		const response = await SDK.cart.updateItemQuantity(updateItemQuantityRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async updateItemQuantity(e) {
    const t = await fetch(`${C}/update-quantity`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        quantity: e.quantity,
        order_id: b(e)
      }),
      headers: E()
    });
    return k(t);
  }
  /**
      * Removes a line item from an order.
      *
      * ```ts
      *	const removeItemRequest = {
      *		orderItemId: '11ee2722e42886d182fa089e019fd17a'
      *	};
      *	try {
      *		const response = await SDK.cart.removeItem(removeItemRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async removeItem(e) {
    const t = await fetch(`${C}/remove-item`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        order_id: b(e)
      }),
      headers: E()
    });
    return k(t);
  }
  /**
      * Updates the fulfillment on an order. At the moment must update all properties as it acts like a POST.
      *
      * ```ts
      *	const patchFulfillmentRequest = {
      *		fulfillment: {
      *			fulfillmentType: 'PICKUP',
      *			pickupDetails: {
      *				curbsidePickupRequested: true,
      *				curbsidePickupDetails: {
      *					curbsideDetails: 'Contactless please'
      *				},
      *			}
      *		}
      *	};
      *	try {
      *		const response = await sdk.cart.patchFulfillment(patchFulfillmentRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async patchFulfillment(e) {
    const t = await fetch(`${C}/${b(e)}/fulfillment`, {
      method: "PATCH",
      body: JSON.stringify({
        fulfillment: D(z(e.fulfillment)),
        location_id: e.locationId
      }),
      headers: E()
    });
    return k(t);
  }
}
class ae {
  constructor(e) {
    p(this, "initConfig");
    this.initConfig = e;
  }
  /**
   * Fetches complete details about a past order using the jwt token associated with that order.
   *
   * ```ts
   *  const orderRequest = {
   *      jwtToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE...truncated',
   *      locationId: '11ecdbb1f3706d91a4ab2c601c83f953',
   *      fulfillments: ['shipping']
   *  };
   *	try {
   *		const response = await sdk.orders.getOrder(orderRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async getOrder(e) {
    const t = e.jwtToken, r = e.locationId, o = e.fulfillments;
    if (!t)
      throw new Error("missing jwtToken");
    if (!r)
      throw new Error("missing locationId");
    if (!o)
      throw new Error("missing fulfillments");
    if (!this.initConfig.cmsSiteId)
      throw new Error("missing cmsSiteId");
    if (!Array.isArray(o))
      throw new Error("fulfillments must be an array");
    const n = this.initConfig.cmsSiteId, s = ["shipping", "pickup", "delivery"];
    o.forEach((u) => {
      if (!s.includes(u.toLowerCase()))
        throw new Error("invalid value in fulfillments array: " + u);
    });
    let a = `/app/cms/api/v1/sites/${n}/order-again/${t}?location=${r}`;
    return o.forEach((u) => {
      a += `&fulfillments[]=${u}`;
    }), await (await fetch(a, {
      method: "GET",
      headers: E()
    })).json();
  }
}
class ce {
  /**
      * Used to load up to 5 resources.
      *
      * ```ts
      *  const resourceRequest = {
      *      'categoryListResource': {
      *          type: 'category-list'
      *      },
      *      'categoryOptionsResource': {
      *          type: 'category-options',
      *          filters: {
      *              category_id: '2'
      *          }   
      *      },
      *      'itemListResource': {
      *          type: 'item-list',
      *          filters: {
      *              'option_choices': [ "11ee258c913644169c41a2491ad79fa8" ],
      *              'square_online_id': true
      *          }
      *      },
      *      'cartResource': {
      *          type: 'cart',
      *      },
      *      'itemResource': {
      *          type: 'item',
      *          filters: {
      *              'id': "47HCEE6ZQUFFY3Y7X52CRVCO"
      *          }
      *      }
      *  };
      *	try {
      *		const resources = await sdk.resource.getResource(resourceRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link Error}
      */
  async getResource(e) {
    const t = {};
    for (const n in e) {
      const s = e[n];
      t[n] = s;
    }
    return await (await fetch("/s/api/v1/resource", {
      method: "POST",
      body: JSON.stringify({
        input: t
      }),
      headers: E()
    })).json();
  }
}
const le = {
  ADDRESS: "address",
  GEOCODE: "geocode"
};
class de {
  constructor(e) {
    p(this, "initConfig");
    this.initConfig = e;
  }
  /**
      * Used to get a list of places autocompleted from an address (or partial address).
      *
      * ```ts
      *  const autocompletePlacesRequest = {
      *      address: '4 Pennsylvania Plaza'
      *      types: 'address'
      *  };
      *	try {
      *		const response = await sdk.places.autocompletePlaces(autocompletePlacesRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link Error}
      */
  async autocompletePlaces(e) {
    const t = this.initConfig.userId, r = this.initConfig.siteId, o = e.address, n = e.types ?? le.GEOCODE, s = `/app/store/api/v28/pub/users/${t}/sites/${r}/places?types=${n}&input=${o}`;
    return await (await fetch(s, {
      method: "GET",
      headers: E()
    })).json();
  }
  /**
      * Used to get the full details for a place using a `place_id` from autocompletePlaces.
      *
      * ```ts
      *  const getPlaceRequest = {
      *      placeId: 'G:ChIJFcXEG65ZwokRLH0n5pmtMIQ'
      *  };
      *	try {
      *		const response = await sdk.places.getPlace(getPlaceRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link Error}
      */
  async getPlace(e) {
    const t = this.initConfig.userId, r = this.initConfig.siteId, o = e.placeId, n = `/app/store/api/v28/pub/users/${t}/sites/${r}/places/${o}`, a = await (await fetch(n, {
      method: "GET",
      headers: E()
    })).json();
    return Array.isArray(a.data) && (a.data = {}), a;
  }
}
class ue extends Error {
  constructor(t, r) {
    super(t);
    /** Provides the generic rendered HTML error template that would be rendered via the page on a failure. You can choose to use this to display a rendered error, or handle it how you see fit. */
    p(this, "template");
    this.template = r;
  }
}
class fe {
  /**
      * Used to load a Twig template via the API.
      *
      * ```ts
      *  const templateRequest = {
      *      template: 'sections/item-modal',
      *      props: {
      *          item: {
      *              filters: {
      *                  id: item.id
      *              }
      *          }
      *      }
      *  };
      *	try {
      *		const template = await sdk.template.getTemplate(templateRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link TemplateError}
      */
  async getTemplate(e) {
    const t = await fetch("/s/api/v1/template", {
      method: "POST",
      body: JSON.stringify({
        template: e.template,
        props: e.props
      }),
      headers: E()
    }), r = await t.text();
    if (t.ok === !1)
      throw new ue("Unable to render template", r);
    return r;
  }
}
const J = "customer_xsrf", B = "/app/accounts/v1", he = "/ping", pe = "/loyalty/account/search";
var v, A, $, R, Z, P, M;
class me {
  constructor(e) {
    T(this, A);
    T(this, R);
    /**
        * Calling ping will set the session ID and XSRF token cookies needed for subsequent requests
        */
    T(this, P);
    T(this, v, void 0);
    G(this, v, e);
  }
  async getLoyaltyAccount(e) {
    const t = {
      phone: e
    }, r = await _(this, A, $).call(this, `${B}${pe}`, "POST", t);
    return (r == null ? void 0 : r.data.loyalty_account) ?? null;
  }
}
v = new WeakMap(), A = new WeakSet(), $ = async function(e, t, r = null, o = !0) {
  let n = N(J);
  n || (await _(this, P, M).call(this), n = N(J) ?? "");
  const s = {
    method: t,
    headers: _(this, R, Z).call(this, n)
  };
  r && (s.body = JSON.stringify(r));
  const a = await fetch(e, s);
  if (!a.ok) {
    if (a.status === 404)
      return null;
    if (a.status === 419 && o)
      return await _(this, P, M).call(this), await _(this, A, $).call(this, e, t, r, !1);
    throw new Error(`Error ${a.status}: ${a.statusText}`);
  }
  return await a.json();
}, R = new WeakSet(), Z = function(e) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json; charset=UTF-8",
    "X-XSRF-TOKEN": e,
    "Square-Merchant-Token": j(this, v)
  };
}, P = new WeakSet(), M = async function() {
  const e = `${B}${he}`;
  await fetch(e);
};
class ye {
  constructor(e) {
    p(this, "initConfig");
    p(this, "buyersServiceClient");
    this.initConfig = e, this.buyersServiceClient = new me(e.merchantId);
  }
  /**
      * Used to try and get the coordinates of the buyer based on their IP address.
      * If the coordinates can't be determined, this method returns an empty object.
      *
      * ```ts
      *	try {
      *		const coordinates = await sdk.customers.getCoordinates();
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link Error}
      */
  async getCoordinates() {
    const t = `/app/website/cms/api/v1/users/${this.initConfig.userId}/customers/coordinates`;
    let o = await (await fetch(t, {
      method: "GET",
      headers: E()
    })).json();
    return Array.isArray(o) && (o = {}), o;
  }
  /**
      * Search for an existing customer loyalty account by phone number. 
      * If no loyalty account exists, this method returns an empty object.
      *
      * ```ts
      *	try {
      *		const loyaltyAccount = await sdk.customers.getLoyaltyAccount();
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link Error}
      */
  async getLoyaltyAccount(e) {
    const t = e.phone, r = await this.buyersServiceClient.getLoyaltyAccount(t);
    return r ? {
      data: r
    } : {};
  }
}
const O = {
  INVALID_QUANTITY: "INVALID_QUANTITY",
  SOLD_OUT: "SOLD_OUT",
  STOCK_EXCEEDED: "STOCK_EXCEEDED",
  PER_ORDER_MAX_EXCEEDED: "PER_ORDER_MAX_EXCEEDED"
}, Y = (i) => {
  var r;
  return ((r = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: i
  }).formatToParts(1).find((o) => o.type === "fraction")) == null ? void 0 : r.value.length) ?? 0;
};
class ee {
  /**
   * Formats the Money object based on the provided locale.
   * 
   * @param money - The Money object to format.
   * @param formattedLocale - The locale to format the Money object in (BCP 47).
   * @returns The formatted amount.
   */
  formatMoney(e, t = "en-US") {
    return this.formatAmount(e.amount, e.currency, t);
  }
  /**
   * Formats a subunits amount based on the provided currency and locale.
   * 
   * @param amount - The amount in subunits.
   * @param currency - The currency of the amount (ISO 4217).
   * @param formattedLocale - The locale to format the amount in (BCP 47).
   * @returns The formatted amount.
   */
  formatAmount(e, t, r = "en-US") {
    let o;
    try {
      o = new Intl.NumberFormat(r, {
        style: "currency",
        currency: t
      });
    } catch {
      o = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: t
      });
    }
    const n = Y(t);
    return n > 0 && (e = e / Math.pow(10, n)), o.format(e);
  }
  /**
   * Converts a float amount to the lowest subunits for the currency.
   * 
   * @param float - The float amount to convert.
   * @param currency - The currency of the amount (ISO 4217).
   * @returns The amount in subunits.
   */
  convertFloatToSubunits(e, t) {
    const r = Y(t);
    return r > 0 ? e * Math.pow(10, r) : e;
  }
}
const Q = (i) => {
  const e = [];
  return i.item_option_values && Object.keys(i.item_option_values).forEach((t) => {
    e.push({
      itemOptionId: t,
      choice: i.item_option_values[t].choice
    });
  }), e;
}, Ee = (i) => {
  const e = i.product_type_details.end_date, t = i.product_type_details.end_time;
  let r = e + "T";
  const o = t.split(" "), n = o[0].split(":");
  let s = parseInt(n[0]) + (o[1] === "PM" ? 12 : 0);
  s -= n[0] === "12" ? 12 : 0;
  const a = n[1];
  return s.toString().length === 1 && (r += "0"), r += `${s}:${a}:00${i.product_type_details.timezone_info.utc_offset_string}`, new Date(r);
};
class Ie {
  /**
      * Returns the variations for an item resource.
      */
  getVariations(e) {
    return e.variations;
  }
  /**
      * Returns the item options for an item resource.
      */
  getItemOptions(e) {
    return e.item_options;
  }
  /**
      * Returns the modifier lists for an item resource.
      */
  getModifierLists(e) {
    return e.modifier_lists;
  }
  /**
      * Returns whether a particular variation is sold out.
      */
  isVariationSoldOut(e) {
    return e.sold_out || e.inventory_tracking_enabled && e.inventory === 0;
  }
  /**
      * Returns the QuantityErrorType if there's an item quantity error with the item varation, otherwise null.
      */
  getItemQuantityError(e, t, r) {
    return r <= 0 ? O.INVALID_QUANTITY : this.isVariationSoldOut(t) ? O.SOLD_OUT : t.inventory_tracking_enabled && r > t.inventory ? O.STOCK_EXCEEDED : e.per_order_max && r > e.per_order_max ? O.PER_ORDER_MAX_EXCEEDED : null;
  }
  /**
      * Returns whether all variations of an item are sold out.
      */
  isItemSoldOut(e) {
    return e.variations.every((t) => this.isVariationSoldOut(t));
  }
  /**
      * Returns all variations in stock for the selected options or variation.
      */
  getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t = [], selectedVariationId: r = "", skipStockCheck: o = !1 }) {
    return this.getVariations(e).reduce((n, s) => {
      if (!r && s.item_option_values) {
        const a = Q(s);
        if (!t.every((c) => a.find((d) => d.itemOptionId === c.itemOptionId && d.choice === c.choice)))
          return n;
      } else if (e.variations.length > 1 && s.id !== r)
        return n;
      return !o && this.isVariationSoldOut(s) || n.push(s), n;
    }, []);
  }
  /**
      * Returns whether an item's option choice is disabled based on the selected options.
      */
  isOptionChoiceDisabledForSelectedOptions(e, t, r, o = !0) {
    o && (r = r.filter((a) => a.itemOptionId !== t.itemOptionId));
    const n = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: r });
    let s = !1;
    return n.forEach((a) => {
      Q(a).find((d) => d.itemOptionId === t.itemOptionId && d.choice === t.choice) && (s = !0);
    }), !s;
  }
  /**
      * Returns whether a modifier list is valid for the selected modifiers.
      */
  isModifierListForSelectedModifiersValid(e, t) {
    var a, c;
    const r = t.find((d) => d.id == e.id), o = e.min_selected_modifiers, n = e.max_selected_modifiers;
    let s = ((a = r == null ? void 0 : r.textEntry) == null ? void 0 : a.length) || 0;
    if ((c = r == null ? void 0 : r.choiceSelections) != null && c.length) {
      const d = r.choiceSelections.find((I) => {
        var h;
        return !((h = e.modifiers) != null && h.find((f) => f.id === I));
      }), u = r.choiceSelections.find((I) => {
        var h, f;
        return (f = (h = e.modifiers) == null ? void 0 : h.find((g) => g.id === I)) == null ? void 0 : f.sold_out;
      });
      if (d || u)
        return !1;
      s = r.choiceSelections.length;
    }
    return o && n && o === n ? s === o : o && n ? s >= o && s <= n : n ? s <= n : o ? s >= o : !0;
  }
  /**
      * Returns the disabled option choices for an item based on the selected options.
      */
  getDisabledOptionChoicesForSelectedOptions(e, t, r, o = !0) {
    const n = t.choices.map((a) => ({
      itemOptionId: t.id,
      choice: a
    })), s = [];
    return o && (r = r.filter((a) => a.itemOptionId !== t.id)), n.forEach((a) => {
      this.isOptionChoiceDisabledForSelectedOptions(e, a, r, o) && s.push(a.choice);
    }), s;
  }
  /**
      * Returns whether an item with any combination of selected options, modifiers, variationId, and quantity is valid.
      * @throws {@link ValidateItemError}
      */
  validateItem({ item: e, selectedOptions: t = [], selectedModifiers: r = [], selectedVariationId: o = "", quantity: n = void 0, skipStockCheck: s = !1, skipModifierCheck: a = !1 }) {
    var m, w;
    const c = [];
    let d = !1, u = "", I = O.SOLD_OUT;
    const h = [];
    (m = e.item_options) != null && m.length && !o ? e.item_options.forEach((l) => {
      t != null && t.find((y) => y.itemOptionId === l.id && l.choices.includes(y.choice)) || c.push(l.id);
    }) : !e.item_options && e.variations.length > 1 && !o && (d = !0);
    let f = null;
    if (c.length === 0 && !d) {
      const l = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: o, skipStockCheck: s });
      if (l.length === 0) {
        const y = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: o, skipStockCheck: !0 });
        y.length > 0 && (u = y[0].id);
      } else if (f = l[0], n != null) {
        const y = this.getItemQuantityError(e, f, n);
        y && (I = y, u = f.id);
      }
    }
    if ((w = e.modifier_lists) != null && w.length && !a && e.modifier_lists.forEach((l) => {
      this.isModifierListForSelectedModifiersValid(l, r) || h.push(l.id);
    }), !f || c.length || u || h.length) {
      const l = new Error("Failed to validate item.");
      throw c.length && (l.itemOptionIds = c), d && (l.flatVariationSelectionMissing = !0), u && (l.variationId = u, l.quantityErrorType = I), h.length && (l.modifierListIds = h), l;
    }
    const g = {
      itemId: e.id,
      variationId: f.id,
      modifiers: r
    };
    return n && (g.quantity = n), g;
  }
  /**
      * Returns the price of an item based on the selected options, modifiers, and/or variation id.
      */
  getItemPrice({ item: e, selectedOptions: t = [], selectedVariationId: r = "", selectedModifiers: o = [], skipStockCheck: n = !1, skipModifierCheck: s = !1, formattedLocale: a = void 0 }) {
    var d;
    let c = null;
    try {
      c = this.validateItem({ item: e, selectedOptions: t, selectedVariationId: r, selectedModifiers: o, skipStockCheck: n, skipModifierCheck: s });
    } catch {
    }
    if (c) {
      const u = e.variations.find((m) => m.id === c.variationId);
      let I = u.price.regular.amount, h = u.price.sale.amount;
      const f = u.price.regular.currency;
      (d = c.modifiers) == null || d.forEach((m) => {
        var w, l;
        if (m.type === H.CHOICE || m.type === H.GIFT_WRAP) {
          const y = (w = e.modifier_lists) == null ? void 0 : w.find((S) => S.id === m.id);
          y && ((l = y.modifiers) == null || l.forEach((S) => {
            m.choiceSelections.includes(S.id) && S.price_money && (I += S.price_money.amount, h += S.price_money.amount);
          }));
        }
      });
      const g = {
        regular: {
          amount: I,
          currency: f,
          formatted: ""
        },
        sale: {
          amount: h,
          currency: f,
          formatted: ""
        }
      };
      if (a) {
        const m = new ee();
        g.regular.formatted = m.formatMoney({
          amount: I,
          currency: f,
          formatted: ""
        }, a), g.sale.formatted = m.formatMoney({
          amount: h,
          currency: f,
          formatted: ""
        }, a);
      }
      return g;
    }
    return null;
  }
  /**
      * Returns whether an item is an event and has ended.
      */
  isEventItemInThePast(e) {
    return e.square_online_type !== "EVENT" ? !1 : Ee(e) <= /* @__PURE__ */ new Date();
  }
  /**
      * Returns whether an item is a preorder and the cutoff time has passed.
      */
  isPreorderItemCutoffInThePast(e) {
    if (!e.preordering.PICKUP)
      return !1;
    const t = e.fulfillment_availability.PICKUP[0].availability_cutoff_at;
    return new Date(t) <= /* @__PURE__ */ new Date();
  }
}
class Se {
  constructor(e) {
    p(this, "version", "0.0.0-semantic-release");
    p(this, "cart");
    p(this, "orders");
    p(this, "places");
    p(this, "resource");
    p(this, "template");
    p(this, "customers");
    p(this, "helpers");
    if (!e.userId)
      throw new Error("missing user id");
    if (!e.siteId)
      throw new Error("missing site id");
    if (!e.merchantId)
      throw new Error("missing merchant id");
    if (!Number.isInteger(Number(e.userId)))
      throw new Error("invalid user id");
    if (!Number.isInteger(Number(e.siteId)))
      throw new Error("invalid site id");
    this.cart = new se(), this.orders = new ae(e), this.places = new de(e), this.resource = new ce(), this.template = new fe(), this.customers = new ye(e), this.helpers = {
      item: new Ie(),
      money: new ee()
    };
  }
}
export {
  Se as default
};
