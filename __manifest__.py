{
    'name': 'Website Decimal Quantity',
    'version': '1.0',
    'summary': 'When the user clicks on the + or - button to adjust quantity, It should add or deduct .1 value from it.',
    'author': 'Hafsana CA',
    'depends': ['base','website','sale','product'],
    'data': [
        'views/product_template_views.xml',
        'views/website_sale_templates.xml'
    ],
    'assets': {
        'web.assets_frontend': [
            'website_decimal_quantity/static/src/js/website_sale_decimal.js',
        ],
    },
    'installable': True,
    'application': False,
}