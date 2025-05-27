from odoo.addons.website_sale.controllers.main import WebsiteSale


class WebsiteSaleDecimalQty(WebsiteSale):

    def _prepare_product_values(self, product, category, search, **kwargs):
        res = super()._prepare_product_values(product, category, search, **kwargs)
        res['allow_decimal_qty'] = product.allow_decimal_qty
        print(">>> Decimal qty flag passed to frontend:", product.allow_decimal_qty)
        return res
