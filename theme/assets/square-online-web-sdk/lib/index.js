var q = Object.defineProperty;
var Z = (i, e, t) => e in i ? q(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var y = (i, e, t) => (Z(i, typeof e != "symbol" ? e + "" : e, t), t), b = (i, e, t) => {
  if (!e.has(i))
    throw TypeError("Cannot " + t);
};
var j = (i, e, t) => (b(i, e, "read from private field"), t ? t.call(i) : e.get(i)), w = (i, e, t) => {
  if (e.has(i))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(i) : e.set(i, t);
}, G = (i, e, t, r) => (b(i, e, "write to private field"), r ? r.call(i, t) : e.set(i, t), t);
var _ = (i, e, t) => (b(i, e, "access private method"), t);
const M = {
  SHIPMENT: "SHIPMENT",
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
  MANUAL: "MANUAL"
}, X = {
  ASAP: "ASAP",
  SCHEDULED: "SCHEDULED"
}, x = {
  CHOICE: "CHOICE",
  TEXT: "TEXT",
  GIFT_WRAP: "GIFT_WRAP",
  GIFT_MESSAGE: "GIFT_MESSAGE"
}, ee = () => {
  var i;
  return (i = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : i.content;
}, E = () => ({
  Accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "X-CSRF-TOKEN": ee()
}), N = (i) => {
  const e = i + "=", r = decodeURIComponent(document.cookie).split(";");
  for (let n = 0; n < r.length; n++) {
    let s = r[n];
    for (; s.charAt(0) == " "; )
      s = s.substring(1);
    if (s.indexOf(e) == 0)
      return s.substring(e.length, s.length);
  }
  return null;
}, T = "/s/api/v1/cart", K = "Something went wrong", V = (i, e) => {
  const t = F(e.error || e.message || i.statusText), r = new Error(t);
  if (e.errors) {
    const n = {};
    Object.keys(e.errors).forEach((s) => {
      const o = e.errors[s].map((a) => F(a));
      n[F(s)] = o;
    }), r.errors = n;
  }
  return e.fields && (r.fields = e.fields), i.status && (r.status = i.status, r.status === 200 && (r.status = 500)), r;
}, P = async (i) => {
  const e = await i.json();
  if (!i.ok)
    throw V(i, e);
  return {
    response: i,
    data: e.data
  };
}, te = async (i) => {
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
}, F = (i) => i.replace(/[_][a-z0-9]/g, (e) => e.toUpperCase().replace("_", "")), U = (i) => i.replace(/[A-Z0-9]/g, (e) => `_${e.toLowerCase()}`), O = (i) => {
  const e = {};
  return Object.keys(i).forEach((t) => {
    const r = i[t];
    Array.isArray(r) ? e[U(t)] = Y(r) : r && typeof r == "object" ? e[U(t)] = O(r) : e[U(t)] = r;
  }), e;
}, Y = (i) => {
  const e = [];
  return i.forEach((t) => {
    Array.isArray(t) ? e.push(Y(t)) : t && typeof t == "object" ? e.push(O(t)) : e.push(t);
  }), e;
}, re = (i) => {
  const e = W(i);
  return delete e.order_id, e;
}, Q = (i) => {
  const e = JSON.parse(JSON.stringify(i));
  return e.fulfillmentType === M.PICKUP ? (e.pickupDetails || (e.pickupDetails = {}), e.pickupDetails.scheduleType || (e.pickupDetails.scheduleType = X.ASAP), e.pickupDetails.curbsidePickupRequested == null && (e.pickupDetails.curbsidePickupRequested = !1), e.pickupDetails.curbsidePickupDetails || (e.pickupDetails.curbsidePickupDetails = {
    curbsideDetails: ""
  })) : e.fulfillmentType === M.DELIVERY && e.deliveryDetails && (e.deliveryDetails.noContactDelivery == null && (e.deliveryDetails.noContactDelivery = !1), e.deliveryDetails.scheduleType || (e.deliveryDetails.scheduleType = X.ASAP)), e;
}, W = (i) => {
  var n;
  const e = JSON.parse(JSON.stringify(i.lineItem));
  e.quantity || (e.quantity = 1);
  const t = O(e);
  if ((n = t.modifiers) != null && n.length) {
    const s = {};
    t.modifiers.forEach((o) => {
      if (o.type) {
        s[o.type] || (s[o.type] = {});
        const a = JSON.parse(JSON.stringify(o));
        delete a.id, delete a.type, s[o.type][o.id] = a;
      }
    }), t.modifiers = s;
  } else
    t.modifiers && delete t.modifiers;
  return {
    line_item: t,
    fulfillment: O(Q(i.fulfillment)),
    location_id: i.locationId,
    // JSON.stringify will remove if undefined
    order_id: k(i)
  };
}, k = (i) => i.orderId !== void 0 ? i.orderId : N("com_cart_id") || void 0;
class ie {
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
    const t = W(e), r = await fetch(`${T}/add`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: E()
    });
    return await P(r);
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
    const t = re(e), r = await fetch(`${T}/buy`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: E()
    });
    return te(r);
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
    const t = await fetch(`${T}/update-quantity`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        quantity: e.quantity,
        order_id: k(e)
      }),
      headers: E()
    });
    return P(t);
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
    const t = await fetch(`${T}/remove-item`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        order_id: k(e)
      }),
      headers: E()
    });
    return P(t);
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
    const t = await fetch(`${T}/${k(e)}/fulfillment`, {
      method: "PATCH",
      body: JSON.stringify({
        fulfillment: O(Q(e.fulfillment)),
        location_id: e.locationId
      }),
      headers: E()
    });
    return P(t);
  }
}
class se {
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
    const t = e.jwtToken, r = e.locationId, n = e.fulfillments;
    if (!t)
      throw new Error("missing jwtToken");
    if (!r)
      throw new Error("missing locationId");
    if (!n)
      throw new Error("missing fulfillments");
    if (!this.initConfig.cmsSiteId)
      throw new Error("missing cmsSiteId");
    if (!Array.isArray(n))
      throw new Error("fulfillments must be an array");
    const s = this.initConfig.cmsSiteId, o = ["shipping", "pickup", "delivery"];
    n.forEach((l) => {
      if (!o.includes(l.toLowerCase()))
        throw new Error("invalid value in fulfillments array: " + l);
    });
    let a = `/app/cms/api/v1/sites/${s}/order-again/${t}?location=${r}`;
    return n.forEach((l) => {
      a += `&fulfillments[]=${l}`;
    }), await (await fetch(a, {
      method: "GET",
      headers: E()
    })).json();
  }
}
class ne {
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
    for (const s in e) {
      const o = e[s];
      t[s] = o;
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
const oe = {
  ADDRESS: "address",
  GEOCODE: "geocode"
};
class ae {
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
    const t = this.initConfig.userId, r = this.initConfig.siteId, n = e.address, s = e.types ?? oe.GEOCODE, o = `/app/store/api/v28/pub/users/${t}/sites/${r}/places?types=${s}&input=${n}`;
    return await (await fetch(o, {
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
    const t = this.initConfig.userId, r = this.initConfig.siteId, n = e.placeId, s = `/app/store/api/v28/pub/users/${t}/sites/${r}/places/${n}`, a = await (await fetch(s, {
      method: "GET",
      headers: E()
    })).json();
    return Array.isArray(a.data) && (a.data = {}), a;
  }
}
class ce extends Error {
  constructor(t, r) {
    super(t);
    /** Provides the generic rendered HTML error template that would be rendered via the page on a failure. You can choose to use this to display a rendered error, or handle it how you see fit. */
    y(this, "template");
    this.template = r;
  }
}
class le {
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
      throw new ce("Unable to render template", r);
    return r;
  }
}
const C = {
  INVALID_QUANTITY: "INVALID_QUANTITY",
  SOLD_OUT: "SOLD_OUT",
  STOCK_EXCEEDED: "STOCK_EXCEEDED",
  PER_ORDER_MAX_EXCEEDED: "PER_ORDER_MAX_EXCEEDED"
}, H = (i) => {
  const e = [];
  return i.item_option_values && Object.keys(i.item_option_values).forEach((t) => {
    e.push({
      itemOptionId: t,
      choice: i.item_option_values[t].choice
    });
  }), e;
}, de = (i) => {
  const e = i.product_type_details.end_date, t = i.product_type_details.end_time;
  let r = e + "T";
  const n = t.split(" "), s = n[0].split(":");
  let o = parseInt(s[0]) + (n[1] === "PM" ? 12 : 0);
  o -= s[0] === "12" ? 12 : 0;
  const a = s[1];
  return o.toString().length === 1 && (r += "0"), r += `${o}:${a}:00${i.product_type_details.timezone_info.utc_offset_string}`, new Date(r);
};
class ue {
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
    return r <= 0 ? C.INVALID_QUANTITY : this.isVariationSoldOut(t) ? C.SOLD_OUT : t.inventory_tracking_enabled && r > t.inventory ? C.STOCK_EXCEEDED : e.per_order_max && r > e.per_order_max ? C.PER_ORDER_MAX_EXCEEDED : null;
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
  getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t = [], selectedVariationId: r = "", skipStockCheck: n = !1 }) {
    return this.getVariations(e).reduce((s, o) => {
      if (!r && o.item_option_values) {
        const a = H(o);
        if (!t.every((c) => a.find((u) => u.itemOptionId === c.itemOptionId && u.choice === c.choice)))
          return s;
      } else if (e.variations.length > 1 && o.id !== r)
        return s;
      return !n && this.isVariationSoldOut(o) || s.push(o), s;
    }, []);
  }
  /**
      * Returns whether an item's option choice is disabled based on the selected options.
      */
  isOptionChoiceDisabledForSelectedOptions(e, t, r, n = !0) {
    n && (r = r.filter((a) => a.itemOptionId !== t.itemOptionId));
    const s = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: r });
    let o = !1;
    return s.forEach((a) => {
      H(a).find((u) => u.itemOptionId === t.itemOptionId && u.choice === t.choice) && (o = !0);
    }), !o;
  }
  /**
      * Returns whether a modifier list is valid for the selected modifiers.
      */
  isModifierListForSelectedModifiersValid(e, t) {
    var a, c;
    const r = t.find((u) => u.id == e.id), n = e.min_selected_modifiers, s = e.max_selected_modifiers;
    let o = ((a = r == null ? void 0 : r.textEntry) == null ? void 0 : a.length) || 0;
    if ((c = r == null ? void 0 : r.choiceSelections) != null && c.length) {
      const u = r.choiceSelections.find((I) => {
        var h;
        return !((h = e.modifiers) != null && h.find((m) => m.id === I));
      }), l = r.choiceSelections.find((I) => {
        var h, m;
        return (m = (h = e.modifiers) == null ? void 0 : h.find((f) => f.id === I)) == null ? void 0 : m.sold_out;
      });
      if (u || l)
        return !1;
      o = r.choiceSelections.length;
    }
    return n && s && n === s ? o === n : n && s ? o >= n && o <= s : s ? o <= s : n ? o >= n : !0;
  }
  /**
      * Returns the disabled option choices for an item based on the selected options.
      */
  getDisabledOptionChoicesForSelectedOptions(e, t, r, n = !0) {
    const s = t.choices.map((a) => ({
      itemOptionId: t.id,
      choice: a
    })), o = [];
    return n && (r = r.filter((a) => a.itemOptionId !== t.id)), s.forEach((a) => {
      this.isOptionChoiceDisabledForSelectedOptions(e, a, r, n) && o.push(a.choice);
    }), o;
  }
  /**
      * Returns whether an item with any combination of selected options, modifiers, variationId, and quantity is valid.
      * @throws {@link ValidateItemError}
      */
  validateItem({ item: e, selectedOptions: t = [], selectedModifiers: r = [], selectedVariationId: n = "", quantity: s = void 0, skipStockCheck: o = !1, skipModifierCheck: a = !1 }) {
    var g, S;
    const c = [];
    let u = !1, l = "", I = C.SOLD_OUT;
    const h = [];
    (g = e.item_options) != null && g.length && !n ? e.item_options.forEach((d) => {
      t != null && t.find((p) => p.itemOptionId === d.id && d.choices.includes(p.choice)) || c.push(d.id);
    }) : !e.item_options && e.variations.length > 1 && !n && (u = !0);
    let m = null;
    if (c.length === 0 && !u) {
      const d = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: n, skipStockCheck: o });
      if (d.length === 0) {
        const p = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: n, skipStockCheck: !0 });
        p.length > 0 && (l = p[0].id);
      } else if (m = d[0], s != null) {
        const p = this.getItemQuantityError(e, m, s);
        p && (I = p, l = m.id);
      }
    }
    if ((S = e.modifier_lists) != null && S.length && !a && e.modifier_lists.forEach((d) => {
      this.isModifierListForSelectedModifiersValid(d, r) || h.push(d.id);
    }), !m || c.length || l || h.length) {
      const d = new Error("Failed to validate item.");
      throw c.length && (d.itemOptionIds = c), u && (d.flatVariationSelectionMissing = !0), l && (d.variationId = l, d.quantityErrorType = I), h.length && (d.modifierListIds = h), d;
    }
    const f = {
      itemId: e.id,
      variationId: m.id,
      modifiers: r
    };
    return s && (f.quantity = s), f;
  }
  /**
      * Returns the price of an item based on the selected options, modifiers, and/or variation id.
      */
  getItemPrice({ item: e, selectedOptions: t = [], selectedVariationId: r = "", selectedModifiers: n = [], skipStockCheck: s = !1, skipModifierCheck: o = !1, formattedLocale: a = void 0 }) {
    var u;
    let c = null;
    try {
      c = this.validateItem({ item: e, selectedOptions: t, selectedVariationId: r, selectedModifiers: n, skipStockCheck: s, skipModifierCheck: o });
    } catch {
    }
    if (c) {
      const l = e.variations.find((f) => f.id === c.variationId);
      let I = l.price.regular, h = l.price.sale;
      (u = c.modifiers) == null || u.forEach((f) => {
        var g, S;
        if (f.type === x.CHOICE || f.type === x.GIFT_WRAP) {
          const d = (g = e.modifier_lists) == null ? void 0 : g.find((p) => p.id === f.id);
          d && ((S = d.modifiers) == null || S.forEach((p) => {
            f.choiceSelections.includes(p.id) && p.price_money && (I += p.price_money.amount, h += p.price_money.amount);
          }));
        }
      });
      const m = {
        regular: I,
        sale: h,
        currency: l.price.currency
      };
      if (a) {
        let f;
        try {
          f = new Intl.NumberFormat(a, {
            style: "currency",
            currency: l.price.currency
          });
        } catch {
          f = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: l.price.currency
          });
        }
        m.regularFormatted = f.format(I), m.saleFormatted = f.format(h);
      }
      return m;
    }
    return null;
  }
  /**
      * Returns whether an item is an event and has ended.
      */
  isEventItemInThePast(e) {
    return e.square_online_type !== "EVENT" ? !1 : de(e) <= /* @__PURE__ */ new Date();
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
const J = "customer_xsrf", B = "/app/accounts/v1", fe = "/ping", pe = "/loyalty/account/search";
var D, v, $, R, z, A, L;
class he {
  constructor(e) {
    w(this, v);
    w(this, R);
    /**
        * Calling ping will set the session ID and XSRF token cookies needed for subsequent requests
        */
    w(this, A);
    w(this, D, void 0);
    G(this, D, e);
  }
  async getLoyaltyAccount(e) {
    const t = {
      phone: e
    }, r = await _(this, v, $).call(this, `${B}${pe}`, "POST", t);
    return (r == null ? void 0 : r.data.loyalty_account) ?? null;
  }
}
D = new WeakMap(), v = new WeakSet(), $ = async function(e, t, r = null, n = !0) {
  let s = N(J);
  s || (await _(this, A, L).call(this), s = N(J) ?? "");
  const o = {
    method: t,
    headers: _(this, R, z).call(this, s)
  };
  r && (o.body = JSON.stringify(r));
  const a = await fetch(e, o);
  if (!a.ok) {
    if (a.status === 404)
      return null;
    if (a.status === 419 && n)
      return await _(this, A, L).call(this), await _(this, v, $).call(this, e, t, r, !1);
    throw new Error(`Error ${a.status}: ${a.statusText}`);
  }
  return await a.json();
}, R = new WeakSet(), z = function(e) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json; charset=UTF-8",
    "X-XSRF-TOKEN": e,
    "Square-Merchant-Token": j(this, D)
  };
}, A = new WeakSet(), L = async function() {
  const e = `${B}${fe}`;
  await fetch(e);
};
class me {
  constructor(e) {
    y(this, "initConfig");
    y(this, "buyersServiceClient");
    this.initConfig = e, this.buyersServiceClient = new he(e.merchantId);
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
    let n = await (await fetch(t, {
      method: "GET",
      headers: E()
    })).json();
    return Array.isArray(n) && (n = {}), n;
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
class Ee {
  constructor(e) {
    y(this, "version", "1.0.0-alpha.11");
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
    this.cart = new ie(), this.orders = new se(e), this.places = new ae(e), this.resource = new ne(), this.template = new le(), this.customers = new me(e), this.helpers = {
      item: new ue()
    };
  }
}
export {
  Ee as default
};
