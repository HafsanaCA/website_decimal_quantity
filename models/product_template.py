# -*- coding: utf-8 -*-
from odoo import models, fields

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_decimal_qty = fields.Boolean(string="Is Decimal Quantity")