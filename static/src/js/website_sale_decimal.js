/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";
import { patch } from "@web/core/utils/patch";
import { QuantityButtons } from "@sale/js/quantity_buttons/quantity_buttons";

patch(QuantityButtons.prototype, {
    increaseQuantity() {
        const newQuantity = Math.round((this.props.quantity + 0.1) * 10) / 10;
        this.props.setQuantity(newQuantity);
    },
    decreaseQuantity() {
        const newQuantity = Math.round((this.props.quantity - 0.1) * 10) / 10;
        this.props.setQuantity(newQuantity);
    }
});

patch(publicWidget.registry.WebsiteSale.prototype, {
    onClickAddCartJSON: function (ev) {
        ev.preventDefault();
        var $link = $(ev.currentTarget);
        var $input = $link.closest('.input-group').find("input");
        var min = parseFloat($input.data("min") || 0);
        var max = parseFloat($input.data("max") || Infinity);
        var previousQty = parseFloat($input.val() || 0, 10);
        var quantity = ($link.has(".fa-minus").length ? -0.1 : 0.1) + previousQty;
        var newQty = quantity > min ? (quantity < max ? quantity : max) : min;

        if (newQty !== previousQty) {
            $input.val(newQty.toFixed(1)).trigger('change');
        }
        return false;
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