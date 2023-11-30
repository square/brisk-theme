var U = Object.defineProperty;
var $ = (r, e, t) => e in r ? U(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var y = (r, e, t) => ($(r, typeof e != "symbol" ? e + "" : e, t), t);
const M = {
  SHIPMENT: "SHIPMENT",
  PICKUP: "PICKUP",
  MANUAL: "MANUAL"
}, j = {
  ASAP: "ASAP"
}, v = {
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
}), O = "/s/api/v1/cart", N = "Something went wrong", A = (r, e) => {
  const t = k(e.error || e.message || r.statusText), i = new Error(t);
  if (e.errors) {
    const n = {};
    Object.keys(e.errors).forEach((s) => {
      const o = e.errors[s].map((a) => k(a));
      n[k(s)] = o;
    }), i.errors = n;
  }
  return e.fields && (i.fields = e.fields), r.status && (i.status = r.status, i.status === 200 && (i.status = 500)), i;
}, C = async (r) => {
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
      throw (e = t == null ? void 0 : t.response) != null && e.errors ? A(r, t.response.errors) : new Error(N);
    }
    window.location.href = r.url;
    return;
  } else if (!r.ok) {
    const t = await r.json();
    throw A(r, t);
  }
  throw new Error(N);
}, k = (r) => r.replace(/[_][a-z0-9]/g, (e) => e.toUpperCase().replace("_", "")), P = (r) => r.replace(/[A-Z0-9]/g, (e) => `_${e.toLowerCase()}`), T = (r) => {
  const e = {};
  return Object.keys(r).forEach((t) => {
    const i = r[t];
    Array.isArray(i) ? e[P(t)] = F(i) : i && typeof i == "object" ? e[P(t)] = T(i) : e[P(t)] = i;
  }), e;
}, F = (r) => {
  const e = [];
  return r.forEach((t) => {
    Array.isArray(t) ? e.push(F(t)) : t && typeof t == "object" ? e.push(T(t)) : e.push(t);
  }), e;
}, X = (r) => {
  const e = r + "=", i = decodeURIComponent(document.cookie).split(";");
  for (let n = 0; n < i.length; n++) {
    let s = i[n];
    for (; s.charAt(0) == " "; )
      s = s.substring(1);
    if (s.indexOf(e) == 0)
      return s.substring(e.length, s.length);
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
}, D = (r) => {
  var t;
  const e = b(r.fulfillment);
  return e.fulfillmentType === M.PICKUP && ((t = e.pickupDetails) == null ? void 0 : t.scheduleType) === j.ASAP;
}, V = (r) => {
  var n;
  const e = JSON.parse(JSON.stringify(r.lineItem));
  e.quantity || (e.quantity = 1);
  const t = T(e);
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
    fulfillment: T(b(r.fulfillment)),
    location_id: r.locationId,
    // JSON.stringify will remove if undefined
    order_id: E(r)
  };
}, E = (r) => r.orderId !== void 0 ? r.orderId : X("com_cart_id") || void 0;
class J {
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
    const t = V(e), i = await fetch(`${O}/add`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: I()
    }), n = await C(i);
    return D(e) && await this.patchAsapPickupTime(e), n;
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
    const t = G(e), i = await fetch(`${O}/buy`, {
      method: "POST",
      body: JSON.stringify(t),
      headers: I()
    });
    return !e.lineItem.subscriptionPlanVariationId && D(e) && await this.patchAsapPickupTime(e), L(i);
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
    const t = await fetch(`${O}/update-quantity`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        quantity: e.quantity,
        order_id: E(e)
      }),
      headers: I()
    });
    return C(t);
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
    const t = await fetch(`${O}/remove-item`, {
      method: "POST",
      body: JSON.stringify({
        order_item_id: e.orderItemId,
        order_id: E(e)
      }),
      headers: I()
    });
    return C(t);
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
    const t = await fetch(`${O}/${E(e)}/fulfillment`, {
      method: "PATCH",
      body: JSON.stringify({
        fulfillment: T(b(e.fulfillment))
      }),
      headers: I()
    });
    return C(t);
  }
  /**
   * Updates your ASAP pickup order to the earliest available pickup time based on your order items and store settings (e.g. prep times).
   * At the moment must provide all other existing fulfillment properties as it acts like a POST. Note that if
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
   *		const response = await sdk.cart.patchAsapPickupTime(patchAsapPickupTimeRequest);
   *	} catch (error) {
   *		// Handle errors
   *	}
   * ```
   * @throws {@link CartError}
   */
  async patchAsapPickupTime(e) {
    var t;
    if (D(e)) {
      const n = await (await fetch("/s/api/v1/resource", {
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
      if ((t = n.schedule) != null && t.earliest_time.time_unix) {
        const s = new Date(n.schedule.earliest_time.time_unix * 1e3).toISOString().split(".")[0] + "Z", o = {
          orderId: E(e),
          fulfillment: JSON.parse(JSON.stringify(e.fulfillment))
        };
        return o.fulfillment.pickupDetails || (o.fulfillment.pickupDetails = {}), o.fulfillment.pickupDetails.pickupAt = s, this.patchFulfillment(o);
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
      headers: I()
    })).json();
  }
}
class B {
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
    const t = this.initConfig.userId, i = this.initConfig.siteId, n = e.address, s = `/app/store/api/v28/pub/users/${t}/sites/${i}/places?types=geocode&input=${n}`;
    return await (await fetch(s, {
      method: "GET",
      headers: I()
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
    const t = this.initConfig.userId, i = this.initConfig.siteId, n = e.placeId, s = `/app/store/api/v28/pub/users/${t}/sites/${i}/places/${n}`, a = await (await fetch(s, {
      method: "GET",
      headers: I()
    })).json();
    return Array.isArray(a.data) && (a.data = {}), a;
  }
}
class H extends Error {
  constructor(t, i) {
    super(t);
    /** Provides the generic rendered HTML error template that would be rendered via the page on a failure. You can choose to use this to display a rendered error, or handle it how you see fit. */
    y(this, "template");
    this.template = i;
  }
}
class Q {
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
      headers: I()
    }), i = await t.text();
    if (t.ok === !1)
      throw new H("Unable to render template", i);
    return i;
  }
}
const w = {
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
  const n = t.split(" "), s = n[0].split(":");
  let o = parseInt(s[0]) + (n[1] === "PM" ? 12 : 0);
  o -= s[0] === "12" ? 12 : 0;
  const a = s[1];
  return o.toString().length === 1 && (i += "0"), i += `${o}:${a}:00${r.product_type_details.timezone_info.utc_offset_string}`, new Date(i);
};
class Y {
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
  getItemQuantityError(e, t, i) {
    return i <= 0 ? w.INVALID_QUANTITY : this.isVariationSoldOut(t) ? w.SOLD_OUT : t.inventory_tracking_enabled && i > t.inventory ? w.STOCK_EXCEEDED : e.per_order_max && i > e.per_order_max ? w.PER_ORDER_MAX_EXCEEDED : null;
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
  getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t = [], selectedVariationId: i = "", skipStockCheck: n = !1 }) {
    return this.getVariations(e).reduce((s, o) => {
      if (!i && o.item_option_values) {
        const a = R(o);
        if (!t.every((l) => a.find((d) => d.itemOptionId === l.itemOptionId && d.choice === l.choice)))
          return s;
      } else if (e.variations.length > 1 && o.id !== i)
        return s;
      return !n && this.isVariationSoldOut(o) || s.push(o), s;
    }, []);
  }
  /**
   * Returns whether an item's option choice is disabled based on the selected options.
   */
  isOptionChoiceDisabledForSelectedOptions(e, t, i, n = !0) {
    n && (i = i.filter((a) => a.itemOptionId !== t.itemOptionId));
    const s = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: i });
    let o = !1;
    return s.forEach((a) => {
      R(a).find((d) => d.itemOptionId === t.itemOptionId && d.choice === t.choice) && (o = !0);
    }), !o;
  }
  /**
   * Returns whether a modifier list is valid for the selected modifiers.
   */
  isModifierListForSelectedModifiersValid(e, t) {
    var a, l;
    const i = t.find((d) => d.id == e.id), n = e.min_selected_modifiers, s = e.max_selected_modifiers;
    let o = ((a = i == null ? void 0 : i.textEntry) == null ? void 0 : a.length) || 0;
    if ((l = i == null ? void 0 : i.choiceSelections) != null && l.length) {
      const d = i.choiceSelections.find((_) => {
        var h;
        return !((h = e.modifiers) != null && h.find((m) => m.id === _));
      }), p = i.choiceSelections.find((_) => {
        var h, m;
        return (m = (h = e.modifiers) == null ? void 0 : h.find((u) => u.id === _)) == null ? void 0 : m.sold_out;
      });
      if (d || p)
        return !1;
      o = i.choiceSelections.length;
    }
    return n && s && n === s ? o === n : n && s ? o >= n && o <= s : s ? o <= s : n ? o >= n : !0;
  }
  /**
   * Returns the disabled option choices for an item based on the selected options.
   */
  getDisabledOptionChoicesForSelectedOptions(e, t, i, n = !0) {
    const s = t.choices.map((a) => ({
      itemOptionId: t.id,
      choice: a
    })), o = [];
    return n && (i = i.filter((a) => a.itemOptionId !== t.id)), s.forEach((a) => {
      this.isOptionChoiceDisabledForSelectedOptions(e, a, i, n) && o.push(a.choice);
    }), o;
  }
  /**
   * Returns whether an item with any combination of selected options, modifiers, variationId, and quantity is valid.
   * @throws {@link ValidateItemError}
   */
  validateItem({ item: e, selectedOptions: t = [], selectedModifiers: i = [], selectedVariationId: n = "", quantity: s = void 0, skipStockCheck: o = !1, skipModifierCheck: a = !1 }) {
    var S, g;
    const l = [];
    let d = !1, p = "", _ = w.SOLD_OUT;
    const h = [];
    (S = e.item_options) != null && S.length && !n ? e.item_options.forEach((c) => {
      t != null && t.find((f) => f.itemOptionId === c.id && c.choices.includes(f.choice)) || l.push(c.id);
    }) : !e.item_options && e.variations.length > 1 && !n && (d = !0);
    let m = null;
    if (l.length === 0 && !d) {
      const c = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: n, skipStockCheck: o });
      if (c.length === 0) {
        const f = this.getInStockVariationsForSelectedOptionsOrVariation({ item: e, selectedOptions: t, selectedVariationId: n, skipStockCheck: !0 });
        f.length > 0 && (p = f[0].id);
      } else if (m = c[0], s != null) {
        const f = this.getItemQuantityError(e, m, s);
        f && (_ = f, p = m.id);
      }
    }
    if ((g = e.modifier_lists) != null && g.length && !a && e.modifier_lists.forEach((c) => {
      this.isModifierListForSelectedModifiersValid(c, i) || h.push(c.id);
    }), !m || l.length || p || h.length) {
      const c = new Error("Failed to validate item.");
      throw l.length && (c.itemOptionIds = l), d && (c.flatVariationSelectionMissing = !0), p && (c.variationId = p, c.quantityErrorType = _), h.length && (c.modifierListIds = h), c;
    }
    const u = {
      itemId: e.id,
      variationId: m.id,
      modifiers: i
    };
    return s && (u.quantity = s), u;
  }
  /**
   * Returns the price of an item based on the selected options, modifiers, and/or variation id.
   */
  getItemPrice({ item: e, selectedOptions: t = [], selectedVariationId: i = "", selectedModifiers: n = [], skipStockCheck: s = !1, skipModifierCheck: o = !1, formattedLocale: a = void 0 }) {
    var d;
    let l = null;
    try {
      l = this.validateItem({ item: e, selectedOptions: t, selectedVariationId: i, selectedModifiers: n, skipStockCheck: s, skipModifierCheck: o });
    } catch {
    }
    if (l) {
      const p = e.variations.find((u) => u.id === l.variationId);
      let _ = p.price.regular, h = p.price.sale;
      (d = l.modifiers) == null || d.forEach((u) => {
        var S, g;
        if (u.type === v.CHOICE || u.type === v.GIFT_WRAP) {
          const c = (S = e.modifier_lists) == null ? void 0 : S.find((f) => f.id === u.id);
          c && ((g = c.modifiers) == null || g.forEach((f) => {
            u.choiceSelections.includes(f.id) && f.price_money && (_ += f.price_money.amount, h += f.price_money.amount);
          }));
        }
      });
      const m = {
        regular: _,
        sale: h,
        currency: p.price.currency
      };
      if (a) {
        let u;
        try {
          u = new Intl.NumberFormat(a, {
            style: "currency",
            currency: p.price.currency
          });
        } catch {
          u = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: p.price.currency
          });
        }
        m.regularFormatted = u.format(_), m.saleFormatted = u.format(h);
      }
      return m;
    }
    return null;
  }
  /**
   * Returns whether an item is an event and has ended.
   */
  isEventItemInThePast(e) {
    return e.square_online_type !== "EVENT" ? !1 : W(e) <= /* @__PURE__ */ new Date();
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
class Z {
  constructor(e) {
    y(this, "initConfig");
    this.initConfig = e;
  }
  /**
   * Used to try and get the coordinates of the buyer based on their IP address.
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
      headers: I()
    })).json();
    return Array.isArray(n) && (n = {}), n;
  }
}
class q {
  constructor(e) {
    y(this, "version", "4.4.3");
    y(this, "cart");
    y(this, "places");
    y(this, "resource");
    y(this, "template");
    y(this, "customers");
    y(this, "helpers");
    if (!e.userId)
      throw new Error("missing user id");
    if (!e.siteId)
      throw new Error("missing site id");
    if (!Number.isInteger(Number(e.userId)))
      throw new Error("invalid user id");
    if (!Number.isInteger(Number(e.siteId)))
      throw new Error("invalid site id");
    this.cart = new J(), this.places = new B(e), this.resource = new K(), this.template = new Q(), this.customers = new Z(e), this.helpers = {
      item: new Y()
    };
  }
}
export {
  q as default
};
