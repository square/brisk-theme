var ae = Object.defineProperty;
var ce = (n, e, t) => e in n ? ae(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var y = (n, e, t) => (ce(n, typeof e != "symbol" ? e + "" : e, t), t), V = (n, e, t) => {
  if (!e.has(n))
    throw TypeError("Cannot " + t);
};
var K = (n, e, t) => (V(n, e, "read from private field"), t ? t.call(n) : e.get(n)), v = (n, e, t) => {
  if (e.has(n))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(n) : e.set(n, t);
}, Y = (n, e, t, r) => (V(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t);
var _ = (n, e, t) => (V(n, e, "access private method"), t);
const B = {
  SHIPMENT: "SHIPMENT",
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
  MANUAL: "MANUAL"
}, J = {
  ASAP: "ASAP",
  SCHEDULED: "SCHEDULED"
}, W = {
  CHOICE: "CHOICE",
  TEXT: "TEXT",
  GIFT_WRAP: "GIFT_WRAP",
  GIFT_MESSAGE: "GIFT_MESSAGE"
}, ue = () => {
  var n;
  return (n = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : n.content;
}, S = () => ({
  Accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "X-CSRF-TOKEN": ue()
}), U = (n) => {
  const e = n + "=", r = decodeURIComponent(document.cookie).split(";");
  for (let i = 0; i < r.length; i++) {
    let o = r[i];
    for (; o.charAt(0) == " "; )
      o = o.substring(1);
    if (o.indexOf(e) == 0)
      return o.substring(e.length, o.length);
  }
  return null;
}, C = "/s/api/v1/cart", Q = "Something went wrong", G = (n, e) => {
  const t = x(e.error || e.message || n.statusText), r = new Error(t);
  if (e.errors) {
    const i = {};
    Object.keys(e.errors).forEach((o) => {
      const s = e.errors[o].map((a) => x(a));
      i[x(o)] = s;
    }), r.errors = i;
  }
  return e.fields && (r.fields = e.fields), n.status && (r.status = n.status, r.status === 200 && (r.status = 500)), r;
}, L = async (n) => {
  const e = await n.json();
  if (!n.ok)
    throw G(n, e);
  return {
    response: n,
    data: e.data
  };
}, le = async (n) => {
  var e;
  if (n.redirected) {
    if (window.location.href === n.url) {
      const t = await n.json();
      throw (e = t == null ? void 0 : t.response) != null && e.errors ? G(n, t.response.errors) : new Error(Q);
    }
    window.location.href = n.url;
    return;
  } else if (!n.ok) {
    const t = await n.json();
    throw G(n, t);
  }
  throw new Error(Q);
}, x = (n) => n.replace(/[_][a-z0-9]/g, (e) => e.toUpperCase().replace("_", "")), M = (n) => n.replace(/[A-Z0-9]/g, (e) => `_${e.toLowerCase()}`), k = (n) => {
  const e = {};
  return Object.keys(n).forEach((t) => {
    const r = n[t];
    Array.isArray(r) ? e[M(t)] = te(r) : r && typeof r == "object" ? e[M(t)] = k(r) : e[M(t)] = r;
  }), e;
}, te = (n) => {
  const e = [];
  return n.forEach((t) => {
    Array.isArray(t) ? e.push(te(t)) : t && typeof t == "object" ? e.push(k(t)) : e.push(t);
  }), e;
}, de = (n) => {
  const e = ne(n);
  return delete e.order_id, e;
}, re = (n) => {
  const e = JSON.parse(JSON.stringify(n));
  return e.fulfillmentType === B.PICKUP ? (e.pickupDetails || (e.pickupDetails = {}), e.pickupDetails.scheduleType || (e.pickupDetails.scheduleType = J.ASAP), e.pickupDetails.curbsidePickupRequested == null && (e.pickupDetails.curbsidePickupRequested = !1), e.pickupDetails.curbsidePickupDetails || (e.pickupDetails.curbsidePickupDetails = {
    curbsideDetails: ""
  })) : e.fulfillmentType === B.DELIVERY && e.deliveryDetails && (e.deliveryDetails.noContactDelivery == null && (e.deliveryDetails.noContactDelivery = !1), e.deliveryDetails.scheduleType || (e.deliveryDetails.scheduleType = J.ASAP)), e;
}, ne = (n) => {
  var i;
  const e = JSON.parse(JSON.stringify(n.lineItem));
  e.quantity || (e.quantity = 1);
  const t = k(e);
  if ((i = t.modifiers) != null && i.length) {
    const o = {};
    t.modifiers.forEach((s) => {
      if (s.type) {
        o[s.type] || (o[s.type] = {});
        const a = JSON.parse(JSON.stringify(s));
        delete a.id, delete a.type, o[s.type][s.id] = a;
      }
    }), t.modifiers = o;
  } else
    t.modifiers && delete t.modifiers;
  return {
    line_item: t,
    fulfillment: k(re(n.fulfillment)),
    location_id: n.locationId,
    // JSON.stringify will remove if undefined
    order_id: F(n)
  };
}, F = (n) => n.orderId !== void 0 ? n.orderId : U("com_cart_id") || void 0;
class fe {
  /**
      * Retrieves the active cart id if it exists.
      *
      * ```ts
      * 	const cartId = sdk.cart.getActiveId();
      * ```
      */
  getActiveId() {
    return U("com_cart_id") || void 0;
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
    const t = ne(e), r = await fetch(`${C}/add`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: S()
    });
    return await L(r);
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
    const t = de(e), r = await fetch(`${C}/buy`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: S()
    });
    return le(r);
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
        order_id: F(e)
      }),
      headers: S()
    });
    return L(t);
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
        order_id: F(e)
      }),
      headers: S()
    });
    return L(t);
  }
  /**
      * Replaces the fulfillment on an order.
      *
      * ```ts
      *	const putFulfillmentRequest = {
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
      *		const response = await sdk.cart.putFulfillment(putFulfillmentRequest);
      *	} catch (error) {
      *		// Handle errors
      *	}
      * ```
      * @throws {@link CartError}
      */
  async putFulfillment(e) {
    const t = await fetch(`${C}/${F(e)}/fulfillment`, {
      method: "PUT",
      body: JSON.stringify({
        fulfillment: k(re(e.fulfillment)),
        location_id: e.locationId
      }),
      headers: S()
    });
    return L(t);
  }
}
class me {
  constructor(e) {
    y(this, "initConfig");
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
    const t = e.jwtToken, r = e.locationId, i = e.fulfillments;
    if (!t)
      throw new Error("missing jwtToken");
    if (!r)
      throw new Error("missing locationId");
    if (!i)
      throw new Error("missing fulfillments");
    if (!this.initConfig.cmsSiteId)
      throw new Error("missing cmsSiteId");
    if (!Array.isArray(i))
      throw new Error("fulfillments must be an array");
    const o = this.initConfig.cmsSiteId, s = ["shipping", "pickup", "delivery"];
    i.forEach((l) => {
      if (!s.includes(l.toLowerCase()))
        throw new Error("invalid value in fulfillments array: " + l);
    });
    let a = `/app/cms/api/v1/sites/${o}/order-again/${t}?location=${r}`;
    return i.forEach((l) => {
      a += `&fulfillments[]=${l}`;
    }), await (await fetch(a, {
      method: "GET",
      headers: S()
    })).json();
  }
}
class he {
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
    for (const o in e) {
      const s = e[o];
      t[o] = s;
    }
    return await (await fetch("/s/api/v1/resource", {
      method: "POST",
      body: JSON.stringify({
        input: t
      }),
      headers: S()
    })).json();
  }
}
const pe = {
  ADDRESS: "address",
  GEOCODE: "geocode"
};
class ye {
  constructor(e) {
    y(this, "initConfig");
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
    const t = this.initConfig.userId, r = this.initConfig.siteId, i = e.address, o = e.types ?? pe.GEOCODE, s = `/app/store/api/v28/pub/users/${t}/sites/${r}/places?types=${o}&input=${i}`;
    return await (await fetch(s, {
      method: "GET",
      headers: S()
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
    const t = this.initConfig.userId, r = this.initConfig.siteId, i = e.placeId, o = `/app/store/api/v28/pub/users/${t}/sites/${r}/places/${i}`, a = await (await fetch(o, {
      method: "GET",
      headers: S()
    })).json();
    return Array.isArray(a.data) && (a.data = {}), a;
  }
}
class ge extends Error {
  constructor(t, r) {
    super(t);
    /** Provides the generic rendered HTML error template that would be rendered via the page on a failure. You can choose to use this to display a rendered error, or handle it how you see fit. */
    y(this, "template");
    this.template = r;
  }
}
class Ie {
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
      headers: S()
    }), r = await t.text();
    if (t.ok === !1)
      throw new ge("Unable to render template", r);
    return r;
  }
}
const g = {
  weekdayShort: { weekday: "short" },
  weekdayLong: { weekday: "long" },
  hourNminuteN: { hour: "numeric", minute: "numeric" },
  hourNminuteNsecondN: { hour: "numeric", minute: "numeric", second: "numeric" },
  yearNmonth2day2: { year: "numeric", month: "2-digit", day: "2-digit" },
  yearNmonthNdayN: { year: "numeric", month: "numeric", day: "numeric" },
  yearNmonthLdayN: { year: "numeric", month: "long", day: "numeric" },
  yearNmonthSdayN: { year: "numeric", month: "short", day: "numeric" },
  yearNmonthLdayNhourNminuteN: { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" },
  yearNmonthSdayNhourNminuteN: { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" },
  weekdayLyearNmonthLdayNhourNminuteN: { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" },
  weekdaySyearNmonthSdayNhourNminuteN: { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" },
  weekdayLhourNminuteN: { weekday: "long", hour: "numeric", minute: "numeric" }
}, w = (n) => Number(n.replace(/:/g, "")), Ee = (n, e, t) => {
  const r = new Date(n).toISOString().slice(0, 10);
  return /* @__PURE__ */ new Date(`${r}T${e}${t}`);
}, O = (n, e, t, r, i) => {
  const o = { ...t };
  return o.timeZone = r, typeof i == "boolean" && (o.hour12 = i), n.toLocaleString(e, o);
}, j = (n, e, t) => O(n, e, g.weekdayShort, t).toUpperCase(), D = (n, e, t, r, i) => {
  const o = e.split(":");
  let s = o[0];
  const a = o[1];
  return Number.parseInt(s, 10) === 24 && (s = "0"), n.setHours(Number.parseInt(s, 10), Number.parseInt(a, 10)), O(n, r, t, i).replace("AM", "am").replace("PM", "pm");
};
var ie = /* @__PURE__ */ ((n) => (n.CURRENTLY_OPEN = "currentlyOpen", n.OPENS_LATER_TODAY = "opensLaterToday", n.OPENS_ANOTHER_DAY = "opensAnotherDay", n))(ie || {});
class Se {
  constructor() {
    y(this, "OpenStatus", ie);
  }
  /**
   * Returns the current open status and relevant time for a location's fulfillment type
   *
   * @param {LocationResource} location
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {'PICKUP' | 'DELIVERY'} fulfillment
   * @return { OpenStatusDayAndTime | null }	
   */
  getLocationFulfillmentOpenStatusDayAndTime(e, t, r) {
    const i = e.timezone.name, o = e.timezone.offset_string, s = e[r].hours;
    return this.getOpenStatusDayAndTime(t, i, o, s);
  }
  /**
   * Returns the current open status and relevant time for a location's business hours
   *
   * @param {LocationResource} location
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @return { OpenStatusDayAndTime | null }	
   */
  getLocationBusinessHoursOpenStatusDayAndTime(e, t) {
    const r = e.timezone.name, i = e.timezone.offset_string, o = e.square_business_hours;
    return this.getOpenStatusDayAndTime(t, r, i, o);
  }
  /**
   * Given an hours object, returns the current open status and relevant time
   *
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {string} tzOffsetString
   * @param {Hours} hours
   * @return { OpenStatusDayAndTime | null }
   */
  getOpenStatusDayAndTime(e, t, r, i) {
    const o = /* @__PURE__ */ new Date(), s = this.getCurrentOpenInterval(e, t, i);
    if (s) {
      const c = this.getIntervalCloseDateObject(s, e, t, r, i);
      if (!c)
        return {
          status: this.OpenStatus.CURRENTLY_OPEN,
          time: "",
          day: ""
        };
      const l = O(c, e, g.hourNminuteNsecondN, t, !1), d = D(c, l, g.hourNminuteN, e, t), f = D(c, l, g.weekdayLong, e, t);
      return {
        status: this.OpenStatus.CURRENTLY_OPEN,
        time: d,
        day: f
      };
    }
    const a = this.getNextOpenIntervalToday(e, t, i);
    if (a) {
      const c = D(o, a.open, g.hourNminuteN, e, t), l = D(o, a.open, g.weekdayLong, e, t);
      return {
        status: this.OpenStatus.OPENS_LATER_TODAY,
        time: c,
        day: l
      };
    }
    const u = this.getNextOpenIntervalAfterToday(e, t, i);
    if (u) {
      const { date: c, interval: l } = u, d = D(c, l.open, g.hourNminuteN, e, t), f = D(c, l.open, g.weekdayLong, e, t);
      return {
        status: this.OpenStatus.OPENS_ANOTHER_DAY,
        time: d,
        day: f
      };
    }
    return null;
  }
  /**
   * Returns date object of interval close time, accounting for 24 hour businesses, and hours that span between days
   *
   * @param {OpenInterval} currentOpenInterval
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {string} tzOffsetString
   * @param {Hours} hours
   * @return {Date}
   */
  getIntervalCloseDateObject(e, t, r, i, o) {
    const s = /* @__PURE__ */ new Date();
    let a = e.close, u = O(s, t, g.yearNmonthNdayN, r), c = null, l = 0;
    if (a === "24:00:00") {
      const d = /* @__PURE__ */ new Date();
      for (let f = 0; f < 8; f += 1) {
        if (f === 7)
          return null;
        d.setDate(d.getDate() + 1);
        const p = j(
          d,
          t,
          r
        ), I = o[p];
        if (I.length) {
          const h = I.find((N) => N.open === "00:00:00");
          if (h && h.close === "24:00:00") {
            c = h, l = d.getDay();
            continue;
          }
          if (h) {
            a = h.close, u = O(d, t, g.yearNmonthNdayN, r);
            break;
          }
        }
        c && (a = c.close, d.setDate(l), u = O(d, t, g.yearNmonthNdayN, r));
        break;
      }
    }
    return Ee(
      u,
      a,
      i
    );
  }
  /**
   * Gets open intervals for today
   *
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {Hours} hours
   * @return {OpenInterval[]}
   */
  getOpenIntervalsForToday(e, t, r) {
    const i = j(
      /* @__PURE__ */ new Date(),
      e,
      t
    );
    return r[i];
  }
  /**
   * Get the open interval if we are currently in an open interval. Otherwise null
   *
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {Hours} hours
   * @return {OpenInterval | null }
   */
  getCurrentOpenInterval(e, t, r) {
    const i = this.getOpenIntervalsForToday(e, t, r);
    if (!i.length)
      return null;
    const o = O(/* @__PURE__ */ new Date(), e, g.hourNminuteNsecondN, t, !1);
    let s = w(o);
    return s >= 24e4 && (s -= 24e4), i.find((u) => {
      const { open: c, close: l } = u;
      return s >= w(c) && s < w(l);
    }) || null;
  }
  /**
   * Get the next open interval today
   * If we are currently open in an interval, that will be returned
   *
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {Hours} hours
   * @return {OpenInterval | null }
   */
  getNextOpenIntervalToday(e, t, r) {
    const i = this.getOpenIntervalsForToday(e, t, r);
    if (!i.length)
      return null;
    const o = O(/* @__PURE__ */ new Date(), e, g.hourNminuteNsecondN, t, !1), s = w(o);
    let a = null;
    return i.forEach((u) => {
      const c = w(u.open), l = w(u.close);
      (s < c || s >= c && s < l) && // If we don't have a currentOrNextInterval yet, or if the current interval is earlier than the currentOrNextInterval
      // we are doing this check since the intervals could be be out of order, and we want to make sure we are returing the
      // next closest interval
      (!a || c < w(a.open)) && (a = u);
    }), a;
  }
  /**
   * Get the next opening period after today within the next seven days
   *
   * @param {string} locale - Hyphenized language/country locale combo, e.g. en-US (BCP 47).
   * @param {string} timezone
   * @param {Hours} hours
   * @return {Object | null} { open: openTime, close: closeTime }
   */
  getNextOpenIntervalAfterToday(e, t, r) {
    const i = /* @__PURE__ */ new Date();
    let o = null;
    for (let u = 0; u < 7; u += 1) {
      i.setDate(i.getDate() + 1);
      const c = j(
        i,
        e,
        t
      ), l = r[c];
      if (l.length) {
        o = l[0];
        break;
      }
    }
    if (!o)
      return null;
    const [s, a] = o.open.split(":");
    return i.setHours(Number.parseInt(s, 10), Number.parseInt(a, 10), 0), {
      date: i,
      interval: o
    };
  }
}
const q = "customer_xsrf", Z = "/app/accounts/v1", Oe = "/ping", Ne = "/loyalty/account/search";
var b, P, H, $, oe, R, X;
class we {
  constructor(e) {
    v(this, P);
    v(this, $);
    /**
        * Calling ping will set the session ID and XSRF token cookies needed for subsequent requests
        */
    v(this, R);
    v(this, b, void 0);
    Y(this, b, e);
  }
  async getLoyaltyAccount(e) {
    const t = {
      phone: e
    }, r = await _(this, P, H).call(this, `${Z}${Ne}`, "POST", t);
    return (r == null ? void 0 : r.data.loyalty_account) ?? null;
  }
}
b = new WeakMap(), P = new WeakSet(), H = async function(e, t, r = null, i = !0) {
  let o = U(q);
  o || (await _(this, R, X).call(this), o = U(q) ?? "");
  const s = {
    method: t,
    headers: _(this, $, oe).call(this, o)
  };
  r && (s.body = JSON.stringify(r));
  const a = await fetch(e, s);
  if (!a.ok) {
    if (a.status === 404)
      return null;
    if (a.status === 419 && i)
      return await _(this, R, X).call(this), await _(this, P, H).call(this, e, t, r, !1);
    throw new Error(`Error ${a.status}: ${a.statusText}`);
  }
  return await a.json();
}, $ = new WeakSet(), oe = function(e) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json; charset=UTF-8",
    "X-XSRF-TOKEN": e,
    "Square-Merchant-Token": K(this, b)
  };
}, R = new WeakSet(), X = async function() {
  const e = `${Z}${Oe}`;
  await fetch(e);
};
class Te {
  constructor(e) {
    y(this, "initConfig");
    y(this, "buyersServiceClient");
    this.initConfig = e, this.buyersServiceClient = new we(e.merchantId);
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
    let i = await (await fetch(t, {
      method: "GET",
      headers: S()
    })).json();
    return Array.isArray(i) && (i = {}), i;
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
const A = {
  INVALID_QUANTITY: "INVALID_QUANTITY",
  SOLD_OUT: "SOLD_OUT",
  STOCK_EXCEEDED: "STOCK_EXCEEDED",
  PER_ORDER_MAX_EXCEEDED: "PER_ORDER_MAX_EXCEEDED"
}, z = (n) => {
  var r;
  return ((r = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: n
  }).formatToParts(1).find((i) => i.type === "fraction")) == null ? void 0 : r.value.length) ?? 0;
};
class se {
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
    let i;
    try {
      i = new Intl.NumberFormat(r, {
        style: "currency",
        currency: t
      });
    } catch {
      i = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: t
      });
    }
    return e = this.convertSubunitsToFloat(e, t), i.format(e);
  }
  /**
   * Converts a float amount to the lowest subunits for the currency, e.g. 10.00 to 1000 for USD.
   * 
   * @param float - The float amount to convert.
   * @param currency - The currency of the amount (ISO 4217).
   * @returns The amount in subunits.
   */
  convertFloatToSubunits(e, t) {
    const r = z(t);
    return r > 0 ? e * Math.pow(10, r) : e;
  }
  /**
   * Converts a subunits amount to a float for the currency, e.g. 1000 subunits to 10.00 for USD.
   * 
   * @param subunits - The subunits amount to convert.
   * @param currency - The currency of the amount (ISO 4217).
   * @returns The amount as a float.
   */
  convertSubunitsToFloat(e, t) {
    const r = z(t);
    return r > 0 ? e / Math.pow(10, r) : e;
  }
}
const ee = (n) => {
  const e = [];
  return n.item_option_values && Object.keys(n.item_option_values).forEach((t) => {
    e.push({
      itemOptionId: t,
      choice: n.item_option_values[t].choice
    });
  }), e;
}, _e = (n) => {
  const e = n.item_type_details.end_date, t = n.item_type_details.end_time;
  let r = e + "T";
  const i = t.split(" "), o = i[0].split(":");
  let s = parseInt(o[0]) + (i[1] === "PM" ? 12 : 0);
  s -= o[0] === "12" ? 12 : 0;
  const a = o[1];
  return s.toString().length === 1 && (r += "0"), r += `${s}:${a}:00${n.item_type_details.timezone_info.utc_offset_string}`, new Date(r);
};
class De {
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
    return r <= 0 ? A.INVALID_QUANTITY : this.isVariationSoldOut(t) ? A.SOLD_OUT : t.inventory_tracking_enabled && r > t.inventory ? A.STOCK_EXCEEDED : e.per_order_max && r > e.per_order_max ? A.PER_ORDER_MAX_EXCEEDED : null;
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
  getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t = [], selectedVariationId: r = "", skipStockCheck: i = !1 }) {
    return this.getVariations(e).reduce((o, s) => {
      if (!r && s.item_option_values) {
        const a = ee(s);
        if (!t.every((u) => a.find((c) => c.itemOptionId === u.itemOptionId && c.choice === u.choice)))
          return o;
      } else if (e.variations.length > 1 && s.id !== r)
        return o;
      return !i && this.isVariationSoldOut(s) || o.push(s), o;
    }, []);
  }
  /**
      * Returns whether an item's option choice is disabled based on the selected options.
      */
  isOptionChoiceDisabledForSelectedOptions(e, t, r, i = !0) {
    i && (r = r.filter((a) => a.itemOptionId !== t.itemOptionId));
    const o = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: r });
    let s = !1;
    return o.forEach((a) => {
      ee(a).find((c) => c.itemOptionId === t.itemOptionId && c.choice === t.choice) && (s = !0);
    }), !s;
  }
  /**
      * Returns whether a modifier list is valid for the selected modifiers.
      */
  isModifierListForSelectedModifiersValid(e, t) {
    var a, u;
    const r = t.find((c) => c.id == e.id), i = e.min_selected_modifiers, o = e.max_selected_modifiers;
    let s = ((a = r == null ? void 0 : r.textEntry) == null ? void 0 : a.length) || 0;
    if ((u = r == null ? void 0 : r.choiceSelections) != null && u.length) {
      const c = r.choiceSelections.find((d) => {
        var f;
        return !((f = e.modifiers) != null && f.find((p) => p.id === d));
      }), l = r.choiceSelections.find((d) => {
        var f, p;
        return (p = (f = e.modifiers) == null ? void 0 : f.find((I) => I.id === d)) == null ? void 0 : p.sold_out;
      });
      if (c || l)
        return !1;
      s = r.choiceSelections.length;
    }
    return i && o && i === o ? s === i : i && o ? s >= i && s <= o : o ? s <= o : i ? s >= i : !0;
  }
  /**
      * Returns the disabled option choices for an item based on the selected options.
      */
  getDisabledOptionChoicesForSelectedOptions(e, t, r, i = !0) {
    const o = t.choices.map((a) => ({
      itemOptionId: t.id,
      choice: a
    })), s = [];
    return i && (r = r.filter((a) => a.itemOptionId !== t.id)), o.forEach((a) => {
      this.isOptionChoiceDisabledForSelectedOptions(e, a, r, i) && s.push(a.choice);
    }), s;
  }
  /**
      * Returns whether an item with any combination of selected options, modifiers, variationId, and quantity is valid.
      * @throws {@link ValidateItemError}
      */
  validateItem({ item: e, selectedOptions: t = [], selectedModifiers: r = [], selectedVariationId: i = "", quantity: o = void 0, skipStockCheck: s = !1, skipModifierCheck: a = !1 }) {
    var h, N;
    const u = [];
    let c = !1, l = "", d = A.SOLD_OUT;
    const f = [];
    (h = e.item_options) != null && h.length && !i ? e.item_options.forEach((m) => {
      t != null && t.find((E) => E.itemOptionId === m.id && m.choices.includes(E.choice)) || u.push(m.id);
    }) : !e.item_options && e.variations.length > 1 && !i && (c = !0);
    let p = null;
    if (u.length === 0 && !c) {
      const m = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: i, skipStockCheck: s });
      if (m.length === 0) {
        const E = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: i, skipStockCheck: !0 });
        E.length > 0 && (l = E[0].id);
      } else if (p = m[0], o != null) {
        const E = this.getItemQuantityError(e, p, o);
        E && (d = E, l = p.id);
      }
    }
    if ((N = e.modifier_lists) != null && N.length && !a && e.modifier_lists.forEach((m) => {
      this.isModifierListForSelectedModifiersValid(m, r) || f.push(m.id);
    }), !p || u.length || l || f.length) {
      const m = new Error("Failed to validate item.");
      throw u.length && (m.itemOptionIds = u), c && (m.flatVariationSelectionMissing = !0), l && (m.variationId = l, m.quantityErrorType = d), f.length && (m.modifierListIds = f), m;
    }
    const I = {
      itemId: e.id,
      variationId: p.id,
      modifiers: r
    };
    return o && (I.quantity = o), I;
  }
  /**
      * Returns the price of an item based on the selected options, modifiers, and/or variation id.
      */
  getItemPrice({ item: e, selectedOptions: t = [], selectedVariationId: r = "", selectedModifiers: i = [], skipStockCheck: o = !1, skipModifierCheck: s = !1, formattedLocale: a = void 0 }) {
    var c;
    let u = null;
    try {
      u = this.validateItem({ item: e, selectedOptions: t, selectedVariationId: r, selectedModifiers: i, skipStockCheck: o, skipModifierCheck: s });
    } catch {
    }
    if (u) {
      const l = e.variations.find((h) => h.id === u.variationId);
      let d = l.price.regular.amount, f = l.price.sale.amount;
      const p = l.price.regular.currency;
      (c = u.modifiers) == null || c.forEach((h) => {
        var N, m;
        if (h.type === W.CHOICE || h.type === W.GIFT_WRAP) {
          const E = (N = e.modifier_lists) == null ? void 0 : N.find((T) => T.id === h.id);
          E && ((m = E.modifiers) == null || m.forEach((T) => {
            h.choiceSelections.includes(T.id) && T.price_money && (d += T.price_money.amount, f += T.price_money.amount);
          }));
        }
      });
      const I = {
        regular: {
          amount: d,
          currency: p,
          formatted: ""
        },
        sale: {
          amount: f,
          currency: p,
          formatted: ""
        }
      };
      if (a) {
        const h = new se();
        I.regular.formatted = h.formatMoney({
          amount: d,
          currency: p,
          formatted: ""
        }, a), I.sale.formatted = h.formatMoney({
          amount: f,
          currency: p,
          formatted: ""
        }, a);
      }
      return I;
    }
    return null;
  }
  /**
      * Returns whether an item is an event and has ended.
      */
  isEventItemInThePast(e) {
    return e.square_online_type !== "EVENT" ? !1 : _e(e) <= /* @__PURE__ */ new Date();
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
class Ce {
  constructor(e) {
    y(this, "version", "0.0.0-semantic-release");
    y(this, "cart");
    y(this, "orders");
    y(this, "places");
    y(this, "resource");
    y(this, "template");
    y(this, "customers");
    y(this, "helpers");
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
    this.cart = new fe(), this.orders = new me(e), this.places = new ye(e), this.resource = new he(), this.template = new Ie(), this.customers = new Te(e), this.helpers = {
      item: new De(),
      location: new Se(),
      money: new se()
    };
  }
}
export {
  Ce as default
};
