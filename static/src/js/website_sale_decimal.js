/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";
import { patch } from "@web/core/utils/patch";
import { QuantityButtons } from "@sale/js/quantity_buttons/quantity_buttons";
import { rpc } from "@web/core/network/rpc";
import wSaleUtils from "@website_sale/js/website_sale_utils";

patch(QuantityButtons.prototype, {
    increaseQuantity() {
        const step = parseFloat(this.el.getAttribute('step')) || 1;
        const max = parseFloat(this.el.getAttribute('max')) || Infinity;
        let newQuantity = this.props.quantity + step;
        newQuantity = Math.min(max, newQuantity);
        const isDecimal = step < 1;
        this.props.setQuantity(isDecimal ? parseFloat(newQuantity.toFixed(1)) : parseInt(newQuantity));
    },
    decreaseQuantity() {
        const step = parseFloat(this.el.getAttribute('step')) || 1;
        const min = parseFloat(this.el.getAttribute('min')) || 0;
        let newQuantity = this.props.quantity - step;
        newQuantity = Math.max(min, newQuantity);
        const isDecimal = step < 1;
        this.props.setQuantity(isDecimal ? parseFloat(newQuantity.toFixed(1)) : parseInt(newQuantity));
    },
});

patch(publicWidget.registry.WebsiteSale.prototype, {
    onClickAddCartJSON: function (ev) {
        ev.preventDefault();
        var $link = $(ev.currentTarget);
        var $input = $link.closest('.input-group').find("input");
        var min = parseFloat($input.data("min") || 0);
        var max = parseFloat($input.data("max") || Infinity);
        var previousQty = parseFloat($input.val() || 0, 10);
        var step = parseFloat($input.attr("step")) || 1;
        var quantity = ($link.has(".fa-minus").length ? -step : step) + previousQty;
        var newQty = Math.max(min, Math.min(max, quantity));
        if (newQty !== previousQty) {
            const isDecimal = step < 1;
            $input.val(isDecimal ? newQty.toFixed(1) : parseInt(newQty)).trigger('change');
        }
        return false;
    },

    _changeCartQuantity: function ($input, value, $dom_optional, line_id, productIDs) {
        _.each($dom_optional, function (elem) {
            $(elem).find('.js_quantity').text(value);
            productIDs.push($(elem).find('span[data-product-id]').data('product-id'));
        });
        $input.data('update_change', true);

        this._rpc({
            route: "/shop/cart/update_json",
            params: {
                line_id: line_id,
                product_id: parseInt($input.data('product-id'), 10),
                set_qty: value
            },
        }).then(function (data) {
            $input.data('update_change', false);
            var check_value = parseFloat($input.val());
            if (isNaN(check_value)) {
                check_value = 1;
            }
            if (value !== check_value) {
                $input.trigger('change');
                return;
            }
            if (!data.cart_quantity) {
                return window.location = '/shop/cart';
            }

            // Format cart total quantity: show one decimal if any product allows decimals, else integer
            const $cartLines = $('.js_quantity');
            const hasDecimalProduct = $cartLines.toArray().some(line => parseFloat($(line).attr('step')) < 1);
            const formattedQuantity = hasDecimalProduct ? parseFloat(data.cart_quantity).toFixed(1) : parseInt(data.cart_quantity);
            $(".my_cart_quantity").text(formattedQuantity);

            wSaleUtils.updateCartNavBar({
                ...data,
                cart_quantity: parseFloat(data.cart_quantity),
            });

            $input.val(data.quantity);
            $('.js_quantity[data-line-id=' + line_id + ']').val(data.quantity).text(data.quantity);

            if (data.warning) {
                var cart_alert = $('.oe_cart').parent().find('#data_warning');
                if (cart_alert.length === 0) {
                    $('.oe_cart').prepend('<div class="alert alert-danger alert-dismissable" role="alert" id="data_warning">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + data.warning + '</div>');
                } else {
                    cart_alert.html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + data.warning);
                }
                $input.val(data.quantity);
            }
        });
    },

    _onChangeCartQuantity: function (ev) {
        var $input = $(ev.currentTarget);
        if ($input.data('update_change')) {
            return;
        }
        var value = parseFloat($input.val() || 0, 10);
        if (isNaN(value)) {
            value = 1;
        }
        var $dom = $input.closest('tr');
        var $dom_optional = $dom.nextUntil(':not(.optional_product.info)');
        var line_id = parseInt($input.data('line-id'), 10);
        var productIDs = [parseInt($input.data('product-id'), 10)];
        this._changeCartQuantity($input, value, $dom_optional, line_id, productIDs);
    },
});