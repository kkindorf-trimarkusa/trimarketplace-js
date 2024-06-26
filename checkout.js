const getCartId = () => {
    // Get the string containing the URL
    var urlString = window.location.hash;

    // Split the string to get the query part
    var queryPart = urlString.split('?')[1];

    // Check if the query part exists
    if (queryPart) {
        // Split the query part to get individual parameters
        var queryParams = queryPart.split('&');

        // Loop through each parameter to find the 'id' parameter
        for (var i = 0; i < queryParams.length; i++) {
            var keyValue = queryParams[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1];

            // Check if the parameter key is 'id'
            if (key === 'id') {
                // Return the value when 'id' parameter is found
                return value;
            }
        }
    }
    // Return an empty string if 'id' parameter is not found
    return "";
}

const setRoleView = () => {
    $.get("/delegate/ecom-api/users/current/", function (data) {
        const userRoles = data.roles;
        const admin = userRoles.find((user) => user.name.includes("Approver"));

        if (admin) {
            $(".address-controls").addClass("approver");
            $(".shipping-addresses-selection").addClass("approver");
        }
        else {
            // not admin, hide checkbox

            $("#default-address").hide();
        }
    });
}

$(document).ready(function () {
    var hasEquipmentTrue = false;
    var hasEquipmentFalse = false;
    const equipShippingDiv = $('<div id="shipping-error" style="color:#A12641; padding-bottom:10px; font-weight:600;">Your order contains equipment and non-equipment items. Please go back to update cart .</div>');

    // --------- MutationObserver ------------//
    const config = { childList: true, characterData: true, subtree: true, attributes: true };
    const callback = function (mutationsList, observer) {
        $.get("/delegate/ecom-api/users/current", function (data) {
            const isGroupUser = data.isMultiCompanyUser;
            if (isGroupUser) {
                $('.shipping-addresses-selection').addClass('groupUser')
            }
        });


        setRoleView();

        if (hasEquipmentTrue && hasEquipmentFalse) {
            var isDisabled = $(".btn.continue").prop('disabled');
            if (!isDisabled) {
                // comment out for now
                // $(".btn.continue").prop("disabled", true);
            }

            if ($("#shipping-error").length === 0) {
                // comment out for now
                //$("footer.btn-wrapper").prepend(equipShippingDiv);
            }


        }

        if ((hasEquipmentTrue === true) || (hasEquipmentTrue === true && hasEquipmentFalse === true)) {
            console.log(hasEquipmentFalse, hasEquipmentTrue)
            // console.log('equipment no error')
            // HAS EQUIPMENT BUT NO ERROR
            var input = $('#yourReference');
            hasEquipmentTrue = true;
            if (input && input.val() == "") {
                input.val("equipment |");
                input.change()

            }
        }
    };

    const observer = new MutationObserver(callback);
    var targetNode = document.body;

    if (targetNode) {
        observer.observe(targetNode, config);
    }

    // --------- end MutationObserver ------------//

    var queryString = window.location.search;

    // Create a jQuery object to parse the query string
    var urlParams = new URLSearchParams(queryString);

    // Get the value associated with the 'id' parameter
    var idValue = urlParams.get('id');

    // Get the value associated with the 'id' parameter
    var idValue = getCartId();

    // Check if 'id' parameter exists and has a value
    if (idValue && idValue !== null) {
        $.ajax({
            url: `/delegate/ecom-api/orders/approval/${idValue}/payment`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "x-requested-with": "XMLHttpRequest"
            },
            type: "PUT",
            dataType: "json",
            data: JSON.stringify({ "paymentMethodId": "1" }),
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (response) {

                // Handle success
                // console.log(response);
                response.orderLines.map((line, index) => {
                    const itemNumber = line.item.itemNumber;
                    const itemObject = `/delegate/ecom-api/items/${itemNumber}/attributes?size=-1`;
                    // console.log('line item');
                    // get attributes
                    $.get(itemObject, function (data) {

                        let hasEquipment = false; // Reset for each item
                        data.map((att) => {
                            if (att.key === "PMDM.AT.EquipmentFlag" && att.values?.length) {
                                hasEquipment = true;
                                // console.log("HAS equip")
                            }
                        });

                        if (hasEquipment) {
                            // console.log('has flag');
                            var input = $('#yourReference');
                            hasEquipmentTrue = true

                        } else {
                            // console.log('No flag');
                            hasEquipmentFalse = true;
                        }
                    });
                });
            },
            error: function (xhr, status, error) {
                // Handle error
            }
        });
    } else {
        // this is not an order, just checkout
        $.get("/delegate/ecom-api/orders/current/", function (data) {
            var totalItems = data.orderLines.length;
            //console.log(data)
            // console.log( $(".items") );
            data.orderLines.map((line, index) => {
                // line items
                const itemNumber = line.item.itemNumber;
                const itemObject = `/delegate/ecom-api/items/${itemNumber}/attributes?size=-1`;
                // console.log('line item')
                // get attributes
                $.get(itemObject, function (data) {
                    let hasEquipment = false; // Reset for each item
                    data.map((att) => {
                        if (att.key === "PMDM.AT.EquipmentFlag" && att.values?.length) {
                            hasEquipment = true;
                        }
                    });

                    if (hasEquipment) {
                        // console.log('has flag');
                        var input = $('#yourReference');
                        hasEquipmentTrue = true
                    } else {
                        // console.log('No flag');
                        hasEquipmentFalse = true;
                    }
                });
            });
        });
    }


});




const fooObserver = new MutationObserver((_mutationList, observer) => {
    const shippingStep = $('.checkout-container .checkout-container')
    const checkoutConfirmation = $('.checkout-container .confirmation-container')
    const reviewContainer = $(".checkout-container .review-container")
    //if (shippingStep && window.location.href.includes('checkoutpage/deliverymethod')) {
    // $(".thank-you-container").hide()
    // }
    if (checkoutConfirmation && window.location.href.includes('checkoutpage/confirmation')) {
        $(".thank-you-container").hide()
    }
    if (reviewContainer && window.location.href.includes('checkoutpage/review')) {
        $(".thank-you-container").show()
    }


});

fooObserver.observe(document.body, { childList: true, subtree: true });

var intervalId = window.setInterval(function () {
    const checkoutConfirmationPage = $('.checkout-container .confirmation-container')
    if (checkoutConfirmationPage.length) {
        let appendCount = 0;
        if (appendCount === 0) {
            $('.confirmation-container .title.confirmation').append($(".confirmation-survey").show())
            appendCount++;
            clearInterval(intervalId)
        }
    }
}, 500);