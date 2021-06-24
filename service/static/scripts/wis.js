

//stop browser caching
jQuery.ajaxSetup({cache: false});

//var ajaxurl = 'fluxion.ajax';

var Utils = Utils || {
  /** Maps a form element's child input elements to a JSON object. */
  mappifyForm : function(formName) {
    var values = {};
    jQuery.each(jQuery('#'+formName).serializeArray(), function(i, field) {
      values[field.name] = field.value;
    });
    return values;
  }
};


Utils.ui = {
  /**
 * Add jQuery datepicker
 *
 * @param {String} id - HTML object id.
 */
  addDatePicker : function(id) {
    jQuery("#" + id).datepicker({dateFormat:'dd/mm/yy',showButtonPanel: true});
  },

 /**
 * Disable a button
 *
 * @param {String} buttonDiv - HTML button id.
 */
  disableButton : function(buttonDiv) {
    jQuery('#' + buttonDiv).attr('disabled', 'disabled');
    jQuery('#' + buttonDiv).html("Processing...");
  },

 /**
 * Reenable a button
 *
 * @param {String} buttonDiv - HTML button id.
 * @param {String} text - Button display text.
 */
  reenableButton : function(buttonDiv, text) {
    jQuery('#' + buttonDiv).removeAttr('disabled');
    jQuery('#' + buttonDiv).html(text);
  },

 /**
 * Add jQuery datepicker
 *
 * @param {String} id - HTML object id.
 */
  confirmRemove : function(obj) {
    if (confirm("Are you sure you wish to remove this item?")) {
      obj.remove();
    }
  }
};




