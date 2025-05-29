from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.http import request, route
import logging

_logger = logging.getLogger(__name__)

class WebsiteSaleDecimalQty(WebsiteSale):
    def _prepare_product_values(self, product, category, search, **kwargs):
        res = super()._prepare_product_values(product, category, search, **kwargs)
        res['allow_decimal_qty'] = product.allow_decimal_qty
        _logger.debug("Decimal qty flag passed to frontend: %s", product.allow_decimal_qty)
        return res

    @route(['/shop/cart/update_json'], type='json', auth="public", website=True)
    def cart_update_json(self, product_id, line_id=None, add_qty=1, set_qty=0, display=True):
        product = request.env['product.product'].browse(int(product_id))
        allow_decimal = product.product_tmpl_id.allow_decimal_qty

        if set_qty is None:
            set_qty = 0
        if add_qty is None:
            add_qty = 0

        if allow_decimal:
            add_qty = float(add_qty)
            set_qty = float(set_qty)
        else:
            add_qty = int(round(float(add_qty)))
            set_qty = int(round(float(set_qty)))

        order = request.website.sale_get_order(force_create=1)
        line = order._cart_find_product_line(product_id=product_id, line_id=line_id)

        if set_qty == 0 and line:
            line.unlink()
            order = request.website.sale_get_order()
            values = order._cart_update(product_id=product_id, line_id=line_id, add_qty=0, set_qty=0)
            values.update({
                'cart_quantity': order.cart_quantity,
                **request.website.sale_get_order_info()
            })
            _logger.debug("Cart update response (remove): %s", values)
            return values

        result = super().cart_update_json(product_id, line_id, add_qty, set_qty, display)
        order = request.website.sale_get_order()
        result['cart_quantity'] = order.cart_quantity
        _logger.debug("Cart update response (update): %s", result)
        return result