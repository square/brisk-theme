var U = Object.defineProperty;
var $ = (r, e, t) => e in r ? U(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var _ = (r, e, t) => ($(r, typeof e != "symbol" ? e + "" : e, t), t);
const M = {
  SHIPMENT: "SHIPMENT",
  PICKUP: "PICKUP",
  MANUAL: "MANUAL"
}, j = {
  ASAP: "ASAP"
}, N = {
  CHOICE: "CHOICE",
  TEXT: "TEXT",
  GIFT_WRAP: "GIFT_WRAP",
  GIFT_MESSAGE: "GIFT_MESSAGE"
}, x = () => {
  var r;
  return (r = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : r.content;
}, I = () => ({
  Accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "X-CSRF-TOKEN": x()
}), O = "/s/api/v1/cart", v = "Something went wrong", A = (r, e) => {
  const t = D(e.error || e.message || r.statusText), i = new Error(t);
  if (e.errors) {
    const s = {};
    Object.keys(e.errors).forEach((n) => {
      const o = e.errors[n].map((c) => D(c));
      s[D(n)] = o;
    }), i.errors = s;
  }
  return e.fields && (i.fields = e.fields), r.status && (i.status = r.status, i.status === 200 && (i.status = 500)), i;
}, k = async (r) => {
  const e = await r.json();
  if (!r.ok)
    throw A(r, e);
  return {
    response: r,
    data: e.data
  };
}, L = async (r) => {
  var e;
  if (r.redirected) {
    if (window.location.href === r.url) {
      const t = await r.json();
      throw (e = t == null ? void 0 : t.response) != null && e.errors ? A(r, t.response.errors) : new Error(v);
    }
    window.location.href = r.url;
    return;
  } else if (!r.ok) {
    const t = await r.json();
    throw A(r, t);
  }
  throw new Error(v);
}, D = (r) => r.replace(/[_][a-z0-9]/g, (e) => e.toUpperCase().replace("_", "")), P = (r) => r.replace(/[A-Z0-9]/g, (e) => `_${e.toLowerCase()}`), w = (r) => {
  const e = {};
  return Object.keys(r).forEach((t) => {
    const i = r[t];
    Array.isArray(i) ? e[P(t)] = F(i) : i && typeof i == "object" ? e[P(t)] = w(i) : e[P(t)] = i;
  }), e;
}, F = (r) => {
  const e = [];
  return r.forEach((t) => {
    Array.isArray(t) ? e.push(F(t)) : t && typeof t == "object" ? e.push(w(t)) : e.push(t);
  }), e;
}, X = (r) => {
  const e = r + "=", i = decodeURIComponent(document.cookie).split(";");
  for (let s = 0; s < i.length; s++) {
    let n = i[s];
    for (; n.charAt(0) == " "; )
      n = n.substring(1);
    if (n.indexOf(e) == 0)
      return n.substring(e.length, n.length);
  }
  return null;
}, G = (r) => {
  const e = V(r);
  return delete e.order_id, e;
}, b = (r) => {
  const e = JSON.parse(JSON.stringify(r));
  return e.fulfillmentType === "PICKUP" && (e.pickupDetails || (e.pickupDetails = {}), e.pickupDetails.scheduleType || (e.pickupDetails.scheduleType = "ASAP"), e.pickupDetails.curbsidePickupRequested == null && (e.pickupDetails.curbsidePickupRequested = !1), e.pickupDetails.curbsidePickupDetails || (e.pickupDetails.curbsidePickupDetails = {
    curbsideDetails: ""
  }), e.pickupDetails.pickupAt || (e.pickupDetails.pickupAt = (/* @__PURE__ */ new Date()).toISOString().split(".")[0] + "Z")), e;
}, C = (r) => {
  var t;
  const e = b(r.fulfillment);
  return e.fulfillmentType === M.PICKUP && ((t = e.pickupDetails) == null ? void 0 : t.scheduleType) === j.ASAP;
}, V = (r) => {
  var s;
  const e = JSON.parse(JSON.stringify(r.lineItem));
  e.quantity || (e.quantity = 1);
  const t = w(e);
  if ((s = t.modifiers) != null && s.length) {
    const n = {};
    t.modifiers.forEach((o) => {
      if (o.type) {
        n[o.type] || (n[o.type] = {});
        const c = JSON.parse(JSON.stringify(o));
        delete c.id, delete c.type, n[o.type][o.id] = c;
      }
    }), t.modifiers = n;
  } else
    t.modifiers && delete t.modifiers;
  return {
    line_item: t,
    fulfillment: w(b(r.fulfillment)),
    location_id: r.locationId,
    // JSON.stringify will remove if undefined
    order_id: E(r)
  };
}, E = (r) => r.orderId !== void 0 ? r.orderId : X("com_cart_id") || void 0;
class J {
  /**
   * Adds an item to the current order.
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
   *		let response = await sdk.Cart.addItem(addItemRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async addItem(e) {
    const t = V(e), i = await fetch(`${O}/add`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: I()
    }), s = await k(i);
    return C(e) && await this.patchAsapPickupTime(e), s;
  }
  /**
   * Adds an item to a new order and redirects to checkout (/s/checkout) on success.
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
   *		await sdk.Cart.buyNowItem(buyNowItemRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async buyNowItem(e) {
    const t = G(e), i = await fetch(`${O}/buy`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: I()
    });
    return !e.lineItem.subscriptionPlanVariationId && C(e) && await this.patchAsapPickupTime(e), L(i);
  }
  /**
   * Updates the quantity of an item in the order. Quantity must be greater than 0.
   *
   * ```ts
   *	const updateItemQuantityRequest = {
   *		orderItemId: '11ee2722e42886d182fa089e019fd17a',
   *		quantity: 2
   *	};
   *	try {
   *		let response = await SDK.Cart.updateItemQuantity(updateItemQuantityRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async updateItemQuantity(e) {
    const t = await fetch(`${O}/update-quantity`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        quantity: e.quantity,
        order_id: E(e)
      }),
      headers: I()
    });
    return k(t);
  }
  /**
   * Removes the line item from the order.
   *
   * ```ts
   *	const removeItemRequest = {
   *		orderItemId: '11ee2722e42886d182fa089e019fd17a'
   *	};
   *	try {
   *		let response = await SDK.Cart.removeItem(removeItemRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async removeItem(e) {
    const t = await fetch(`${O}/remove-item`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        order_id: E(e)
      }),
      headers: I()
    });
    return k(t);
  }
  /**
   * Updates the order fulfillment. At the moment must update all properties.
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
   *		let response = await sdk.Cart.patchFulfillment(patchFulfillmentRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async patchFulfillment(e) {
    const t = await fetch(`${O}/${E(e)}/fulfillment`, {
      method: "PATCH",
      body: JSON.stringify({
        fulfillment: w(b(e.fulfillment))
      }),
      headers: I()
    });
    return k(t);
  }
  /**
   * Updates the order fulfillment's `fulfillment.pickupDetails.pickupAt` with the ASAP time.
   * At the moment must provide all other existing fulfillment properties. Note that if
   * you provide `fulfillment.pickupDetails.pickupAt`, it will just be ignored.
   *
   * ```ts
   *	const patchAsapPickupTimeRequest = {
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
   *		let response = await sdk.Cart.patchAsapPickupTime(patchAsapPickupTimeRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   */
  async patchAsapPickupTime(e) {
    var t;
    if (C(e)) {
      const s = await (await fetch("/s/api/v1/resource", {
        method: "POST",
        headers: I(),
        body: JSON.stringify({
          input: {
            schedule: {
              type: "schedule",
              filters: {
                location_id: null
              }
            }
          }
        })
      })).json();
      if ((t = s.schedule) != null && t.earliest_time.time_unix) {
        const n = new Date(s.schedule.earliest_time.time_unix * 1e3).toISOString().split(".")[0] + "Z", o = {
          orderId: E(e),
          fulfillment: JSON.parse(JSON.stringify(e.fulfillment))
        };
        return o.fulfillment.pickupDetails || (o.fulfillment.pickupDetails = {}), o.fulfillment.pickupDetails.pickupAt = n, this.patchFulfillment(o);
      }
    }
    return {
      data: {
        cart: E(e) || ""
      }
    };
  }
}
class K {
  async getResource(e) {
    const t = {};
    for (const n in e) {
      const o = e[n];
      t[n] = o;
    }
    return await (await fetch("/s/api/v1/resource", {
      method: "POST",
      body: JSON.stringify({
        input: t
      }),
      headers: I()
    })).json();
  }
}
class B {
  constructor(e) {
    _(this, "initConfig");
    this.initConfig = e;
  }
  async autocompletePlaces(e) {
    const t = this.initConfig.userId, i = this.initConfig.siteId, s = this.initConfig.cdnDomain, n = e.address, o = `${s}/app/store/api/v28/pub/users/${t}/sites/${i}/places?types=geocode&input=${n}`;
    return await (await fetch(o, {
      method: "GET",
      headers: I()
    })).json();
  }
  async getPlace(e) {
    const t = this.initConfig.userId, i = this.initConfig.siteId, s = this.initConfig.cdnDomain, n = e.placeId, o = `${s}/app/store/api/v28/pub/users/${t}/sites/${i}/places/${n}`;
    return await (await fetch(o, {
      method: "GET",
      headers: I()
    })).json();
  }
}
class H extends Error {
  constructor(t, i) {
    super(t);
    _(this, "template");
    this.template = i;
  }
}
class Q {
  async getTemplate(e) {
    const t = await fetch("/s/api/v1/template", {
      method: "POST",
      body: JSON.stringify({
        template: e.template,
        props: e.props
      }),
      headers: I()
    }), i = await t.text();
    if (t.ok === !1)
      throw new H("Unable to render template", i);
    return i;
  }
}
const T = {
  INVALID_QUANTITY: "INVALID_QUANTITY",
  SOLD_OUT: "SOLD_OUT",
  STOCK_EXCEEDED: "STOCK_EXCEEDED",
  PER_ORDER_MAX_EXCEEDED: "PER_ORDER_MAX_EXCEEDED"
}, R = (r) => {
  const e = [];
  return r.item_option_values && Object.keys(r.item_option_values).forEach((t) => {
    e.push({
      itemOptionId: t,
      choice: r.item_option_values[t].choice
    });
  }), e;
}, W = (r) => {
  const e = r.product_type_details.end_date, t = r.product_type_details.end_time;
  let i = e + "T";
  const s = t.split(" "), n = s[0].split(":");
  let o = parseInt(n[0]) + (s[1] === "PM" ? 12 : 0);
  o -= n[0] === "12" ? 12 : 0;
  const c = n[1];
  return o.toString().length === 1 && (i += "0"), i += `${o}:${c}:00${r.product_type_details.timezone_info.utc_offset_string}`, new Date(i);
};
class Y {
  getVariations(e) {
    return e.variations;
  }
  getItemOptions(e) {
    return e.item_options;
  }
  getModifierLists(e) {
    return e.modifier_lists;
  }
  isVariationSoldOut(e) {
    return e.sold_out || e.inventory_tracking_enabled && e.inventory === 0;
  }
  getItemQuantityError(e, t, i) {
    return i <= 0 ? T.INVALID_QUANTITY : this.isVariationSoldOut(t) ? T.SOLD_OUT : t.inventory_tracking_enabled && i > t.inventory ? T.STOCK_EXCEEDED : e.per_order_max && i > e.per_order_max ? T.PER_ORDER_MAX_EXCEEDED : null;
  }
  isItemSoldOut(e) {
    return e.variations.every((t) => this.isVariationSoldOut(t));
  }
  getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t = [], selectedVariationId: i = "", skipStockCheck: s = !1 }) {
    return this.getVariations(e).reduce((n, o) => {
      if (!i && o.item_option_values) {
        const c = R(o);
        if (!t.every((a) => c.find((d) => d.itemOptionId === a.itemOptionId && d.choice === a.choice)))
          return n;
      } else if (e.variations.length > 1 && o.id !== i)
        return n;
      return !s && this.isVariationSoldOut(o) || n.push(o), n;
    }, []);
  }
  isOptionChoiceDisabledForSelectedOptions(e, t, i, s = !0) {
    s && (i = i.filter((c) => c.itemOptionId !== t.itemOptionId));
    const n = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: i });
    let o = !1;
    return n.forEach((c) => {
      R(c).find((d) => d.itemOptionId === t.itemOptionId && d.choice === t.choice) && (o = !0);
    }), !o;
  }
  isModifierListForSelectedModifiersValid(e, t) {
    var c, a;
    const i = t.find((d) => d.id == e.id), s = e.min_selected_modifiers, n = e.max_selected_modifiers;
    let o = ((c = i == null ? void 0 : i.textEntry) == null ? void 0 : c.length) || 0;
    if ((a = i == null ? void 0 : i.choiceSelections) != null && a.length) {
      const d = i.choiceSelections.find((y) => {
        var h;
        return !((h = e.modifiers) != null && h.find((m) => m.id === y));
      }), p = i.choiceSelections.find((y) => {
        var h, m;
        return (m = (h = e.modifiers) == null ? void 0 : h.find((u) => u.id === y)) == null ? void 0 : m.sold_out;
      });
      if (d || p)
        return !1;
      o = i.choiceSelections.length;
    }
    return s && n && s === n ? o === s : s && n ? o >= s && o <= n : n ? o <= n : s ? o >= s : !0;
  }
  getDisabledOptionChoicesForSelectedOptions(e, t, i, s = !0) {
    const n = t.choices.map((c) => ({
      itemOptionId: t.id,
      choice: c
    })), o = [];
    return s && (i = i.filter((c) => c.itemOptionId !== t.id)), n.forEach((c) => {
      this.isOptionChoiceDisabledForSelectedOptions(e, c, i, s) && o.push(c.choice);
    }), o;
  }
  validateItem({ item: e, selectedOptions: t = [], selectedModifiers: i = [], selectedVariationId: s = "", quantity: n = void 0, skipStockCheck: o = !1, skipModifierCheck: c = !1 }) {
    var S, g;
    const a = [];
    let d = !1, p = "", y = T.SOLD_OUT;
    const h = [];
    (S = e.item_options) != null && S.length && !s ? e.item_options.forEach((l) => {
      t != null && t.find((f) => f.itemOptionId === l.id && l.choices.includes(f.choice)) || a.push(l.id);
    }) : !e.item_options && e.variations.length > 1 && !s && (d = !0);
    let m = null;
    if (a.length === 0 && !d) {
      const l = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: s, skipStockCheck: o });
      if (l.length === 0) {
        const f = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: s, skipStockCheck: !0 });
        f.length > 0 && (p = f[0].id);
      } else if (m = l[0], n != null) {
        const f = this.getItemQuantityError(e, m, n);
        f && (y = f, p = m.id);
      }
    }
    if ((g = e.modifier_lists) != null && g.length && !c && e.modifier_lists.forEach((l) => {
      this.isModifierListForSelectedModifiersValid(l, i) || h.push(l.id);
    }), !m || a.length || p || h.length) {
      const l = new Error("Failed to validate item.");
      throw a.length && (l.itemOptionIds = a), d && (l.flatVariationSelectionMissing = !0), p && (l.variationId = p, l.quantityErrorType = y), h.length && (l.modifierListIds = h), l;
    }
    const u = {
      itemId: e.id,
      variationId: m.id,
      modifiers: i
    };
    return n && (u.quantity = n), u;
  }
  getItemPrice({ item: e, selectedOptions: t = [], selectedVariationId: i = "", selectedModifiers: s = [], skipStockCheck: n = !1, skipModifierCheck: o = !1, formattedLocale: c = void 0 }) {
    var d;
    let a = null;
    try {
      a = this.validateItem({ item: e, selectedOptions: t, selectedVariationId: i, selectedModifiers: s, skipStockCheck: n, skipModifierCheck: o });
    } catch {
    }
    if (a) {
      const p = e.variations.find((u) => u.id === a.variationId);
      let y = p.price.regular, h = p.price.sale;
      (d = a.modifiers) == null || d.forEach((u) => {
        var S, g;
        if (u.type === N.CHOICE || u.type === N.GIFT_WRAP) {
          const l = (S = e.modifier_lists) == null ? void 0 : S.find((f) => f.id === u.id);
          l && ((g = l.modifiers) == null || g.forEach((f) => {
            u.choiceSelections.includes(f.id) && f.price_money && (y += f.price_money.amount, h += f.price_money.amount);
          }));
        }
      });
      const m = {
        regular: y,
        sale: h,
        currency: p.price.currency
      };
      if (c) {
        let u;
        try {
          u = new Intl.NumberFormat(c, {
            style: "currency",
            currency: p.price.currency
          });
        } catch {
          u = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: p.price.currency
          });
        }
        m.regularFormatted = u.format(y), m.saleFormatted = u.format(h);
      }
      return m;
    }
    return null;
  }
  isEventItemInThePast(e) {
    return e.square_online_type !== "EVENT" ? !1 : W(e) <= /* @__PURE__ */ new Date();
  }
  isPreorderItemCutoffInThePast(e) {
    if (!e.preordering.PICKUP)
      return !1;
    const t = e.fulfillment_availability.PICKUP[0].availability_cutoff_at;
    return new Date(t) <= /* @__PURE__ */ new Date();
  }
}
class z {
  constructor(e) {
    _(this, "version", "4.3.2");
    _(this, "cart");
    _(this, "places");
    _(this, "resource");
    _(this, "template");
    _(this, "helpers");
    if (!e.userId)
      throw new Error("missing user id");
    if (!e.siteId)
      throw new Error("missing site id");
    if (!Number.isInteger(Number(e.userId)))
      throw new Error("invalid user id");
    if (!Number.isInteger(Number(e.siteId)))
      throw new Error("invalid site id");
    this.cart = new J(), this.places = new B(e), this.resource = new K(), this.template = new Q(), this.helpers = {
      item: new Y()
    };
  }
}
export {
  z as default
};
