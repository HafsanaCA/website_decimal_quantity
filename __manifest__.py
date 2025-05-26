{
    'name': 'Website Decimal Quantity',
    'version': '1.0',
    'summary': 'When the user clicks on the + or - button to adjust quantity, It should add or deduct .1 value from it.',
    'author': 'Hafsana CA',
    'depends': ['base','website','sale','product'],
    'data': [
    ],
    'assets': {
        'web.assets_frontend': [
            'website_decimal_quantity/static/src/js/website_sale_decimal.js',
        ],
    },
    'installable': True,
    'application': False,
}