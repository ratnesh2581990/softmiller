$( function() {
    $( "#ratechangedate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        maxDate: new Date,
        minDate: new Date(2000, 6, 12)
    });

    $( "#offerstartdate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        minDate: new Date
    });

    $( "#offerenddate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        minDate: new Date
    });

    $( "#filterstartdate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy'
    });

    $( "#filterenddate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy'
    });

    $('#offerstarttime').timepicker({ 'timeFormat': 'h:i A' });
    $('#offerendtime').timepicker({ 'timeFormat': 'h:i A' });
});

function brandPriceChangeFunction(key) {
    var basePrice = parseInt($("#product_price-"+key).val());
    $('.brand-price-'+key).each(function(newindex){
        var originalBrandPrice = parseInt($(this).val());
        var priceDiff = parseInt($("#brand-diff-"+key+"-"+newindex).val());
        var newBrandPrice = parseInt(basePrice + priceDiff);
        $(this).val(newBrandPrice);
    });
}

function basePriceChangeFunction(loopkey, index) {
    var originalBasePrice = parseInt($("#product_price-"+loopkey).val());
    var brandPrice = parseInt($("#brand-price-"+loopkey+"-"+index).val());
    var priceDiff = parseInt(brandPrice - originalBasePrice);
    $("#brand-diff-"+loopkey+"-"+index).val(priceDiff);
}

var priceDiffChangeFunction = function(loopkey, index) {
    var originalBasePrice = parseInt($("#product_price-"+loopkey).val());
    var priceDiff = parseInt($("#brand-diff-"+loopkey+"-"+index).val());
    var newBrandPrice = parseInt(originalBasePrice + priceDiff);
    $("#brand-price-"+loopkey+"-"+index).val(newBrandPrice);
}

var retailerBrandPriceChange = function(loopkey) {
    var retailerBasePrice = parseInt($("#product_retailer_price-"+loopkey).val());
    $('.retailer-brand-price-'+loopkey).each(function(newindex){
        var originalRetailerBrandPrice = parseInt($(this).val());
        var priceDiff = parseInt($("#retailer-brand-diff-"+loopkey+"-"+newindex).val());
        var newBrandPrice = parseInt(retailerBasePrice + priceDiff);
        $(this).val(newBrandPrice);
    });
}

var retailBasePriceChange = function(loopkey, index) {
    var originalBasePrice = parseInt($("#product_retailer_price-"+loopkey).val());
    var brandPrice = parseInt($("#retailer-brand-price-"+loopkey+"-"+index).val());
    var priceDiff = parseInt(brandPrice - originalBasePrice);
    $("#retailer-brand-diff-"+loopkey+"-"+index).val(priceDiff);
}

var retailerPriceDiffChange = function(loopkey, index) {
    var originalBasePrice = parseInt($("#product_retailer_price-"+loopkey).val());
    var priceDiff = parseInt($("#retailer-brand-diff-"+loopkey+"-"+index).val());
    var newBrandPrice = parseInt(originalBasePrice + priceDiff);
    $("#retailer-brand-price-"+loopkey+"-"+index).val(newBrandPrice);
}

$(document).ready(function () {
    'use strict';
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
           return null;
        }
        else{
           return decodeURI(results[1]) || 0;
        }
    }

    function validateEmail($email) {
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailReg.test( $email );
    }

    var checkpass = $.urlParam('pass');
    if( checkpass == 1) {
        setTimeout(function(){ window.location.href = '/settings/passwordsetting'; }, 10000);
    }
    
    $('.repeater').repeater({
        isFirstItemUndeletable: true,
        defaultValues: {
            'textarea-input': 'foo',
            'text-input': 'bar',
            'select-input': 'B',
            'checkbox-input': ['A', 'B'],
        },
        show: function () {
            $(this).slideDown();
        },
        hide: function (deleteElement) {
            if(confirm('Are you sure you want to delete this element?')) {
                $(this).slideUp(deleteElement);
            }
        },
        repeaters: [{
            isFirstItemUndeletable: true,
            selector: '.inner-repeater',
            show: function () {
                $(this).slideDown();
            },
            hide: function (deleteElement) {
                $(this).slideUp(deleteElement);
            }
        }],
        ready: function (setIndexes) {
        }
    });

    var table;
    table = jQuery('.product_detail_table').DataTable({
        dom: 'Bfrtip',
        "lengthChange": true,
        "order": [[ 0, "desc" ]],
        buttons: [
            'excel',
            'print',
            'pdf'
        ]
    });

    function datatablesearch() {
        var whatsSelected = [];
        var filterValue = $("input[name='formfilter']:checked").val();
        console.log(filterValue);
        if(filterValue != 'all') {
            whatsSelected.push(filterValue);
            table.columns(7).search(whatsSelected.join('|'),true).draw();
        } else {
            $('.product_detail_table').DataTable().destroy();
            table = '';
            table = jQuery('.product_detail_table').DataTable({
                dom: 'Bfrtip',
                buttons: [
                    'excel',
                    'print',
                    'pdf'
                ]
            });
        }
    }
  
    $(document).on("click", "input[name='formfilter']", function(){
        datatablesearch();
    });

    $(document).on("change", "#offerproductname", function() {
        $('.loader').show();
        var productID =  $("#offerproductname option:selected").attr("data-productid"); 
        $.ajax({
            type:'GET',
            url: '/offers/getproductbrandbyid',
            dataType:'json',
            data:
            {
                id: productID
            },
            success: function(data) {
                if( data['success'] ) {
                    var productArray = data['product']['productbrand'];
                    var i, j;
                    var brandPackVariationArray = productArray[0]['brand_pack_variation'];
                    var packVariation = '<select class="form-control" name="pack" id="pack">';
                    packVariation += '<option value="all" selected="">All</option>';
                    for(j = 0; j < brandPackVariationArray.length; j++) {
                        console.log(brandPackVariationArray[j]['packvalue']);
                        packVariation += '<option value="'+brandPackVariationArray[j]['packvalue']+'">'+brandPackVariationArray[j]['packvalue']+'</option>';
                    }
                    packVariation += '</select>';
                    var result = '<select class="form-control" name="productbrand" id="productbrand">';
                    result += '<option value="all" selected="">All</option>';
                    $.each(productArray, function( index, value ) {
                        result += '<option value="'+value.productbrand+'" data-serialnumber="'+value.serialnumber+'">'+value.productbrand+'</option>';  
                    });
                    result += '</select>';
                    var idField = '<input type="hidden" name="offerproductid" class="form-control" id="offerproductid" value="'+productID+'"/>';
                    $('.product_id_hidden_div').html(idField);
                    $('.product_brand_div').html(result);
                    $('.product_variation_div').html(packVariation); 
                    $('.loader').hide();
                }
            }
        });
    });

    $(document).on("change", "#productbrand", function(){
        $('.loader').show();
        var productID =  $("#offerproductname option:selected").attr("data-productid");
        var productBrand = $(this).val();
        $.ajax({
            type:'GET',
            url: '/offers/getproductbrandbyid',
            dataType:'json',
            data:
            {
                id: productID
            },
            success: function(data) {
                if( data['success'] ) {
                    var productArray = data['product']['productbrand'];
                    var i, j;
                    var packVariation = '<select class="form-control" name="pack" id="pack">';
                    packVariation += '<option value="all" selected="">All</option>';
                    for (i = 0; i < productArray.length; i++) {
                        if(productArray[i]['productbrand'] == productBrand) {
                            var brandPackVariationArray = productArray[i]['brand_pack_variation'];
                            for(j = 0; j < brandPackVariationArray.length; j++) {
                                console.log(brandPackVariationArray[j]['packvalue']);
                                packVariation += '<option value="'+brandPackVariationArray[j]['packvalue']+'">'+brandPackVariationArray[j]['packvalue']+'</option>';
                            }
                        }
                    }
                    packVariation += '</select>';
                    $('.product_variation_div').html(packVariation);
                    $('.loader').hide();
                }
            }
        });
    });

    $(document).on("click", ".inner-delete-btn", function(){
        var brandIndex = $(this).attr('data-brand-index');
        var parent_id = $(this).closest('.brand_variation_row-'+brandIndex).prop('id');
        $("#"+parent_id).remove();
    });

    $(document).on("click", "#filtersubmit", function(){
        $('.loader').show();
        var dateStart = $('#filterstartdate').val();
        var dateEnd = $('#filterenddate').val();
        var pending = $('input[name="pendingorder"]:checked').val();
        var delivered = $('input[name="deliveredorder"]:checked').val();
        var allorder = $('input[name="allorder"]:checked').val();
        $.ajax({
            type: "POST",
			url: '/orders/orderdetail',
			dataType:'json',
            data:
            {
                startdate: dateStart,
                enddate: dateEnd,
                pending: pending,
                delivered: delivered,
                allorder: allorder
            },
            success: function(data) {
                var i, j, result;
                if( data['success'] == true ) {
                    var order = data['orders'];
                    for (i = 0; i < order.length; i++) {
                        var cartObjectArray = order[i]['cartobject'];
                        for (j = 0; j < cartObjectArray.length; j++) {
                            $.each(cartObjectArray[j], function( index, value ) {
                                result += '<tr>';
                                result += '<td>'+order[i]['orderid']+'</td><td>'+order[i]['customername']+'</td><td>'+order[i]['brokername']+'</td>';
                                result += '<td>'+value['productName']+'</td><td>'+value['offerPrice']+'</td><td>'+value['quantity']+'</td><td>'+value['deliveredQty']+'</td><td>'+value['balanceQty']+'';
                                if(value['balanceQty'] == 0) {
                                    result += '<span style="display:none;">delivered</span>';
                                }else{
                                    result += '<span style="display:none;">pending</span>';
                                }
                                result += '</td><td><a href="/orders/ordersingledetail/?id='+order[i]['_id']+'&key='+index+'">Edit</a></td>';
                                result += '</tr>';
                            });
                        }
                    }
                    $('.order_detail_body').html(result);
                    $('.loader').hide();
                }
            }
        });
    });

    $(document).on("click", "#offerfiltersubmit", function(){
        $('.loader').show();
        var dateStart = $('#filterstartdate').val();
        var dateEnd = $('#filterenddate').val();
        $.ajax({
            type: "POST",
			url: '/offers/all',
			dataType:'json',
            data:
            {
                startdate: dateStart,
                enddate: dateEnd
            },
            success: function(data) {
                var i, result;
                if( data['success'] == true ) {
                    console.log("success true");
                    var offers = data['offers'];
                    for (i = 0; i < offers.length; i++) {
                        var offerstartdate = moment(offers[i]['offerstartdate']).tz("Asia/Kolkata").format('DD/MM/YYYY h:mm a');
                        var offerenddate = moment(offers[i]['offerenddate']).tz("Asia/Kolkata").format('DD/MM/YYYY h:mm a');
                        var remainingQty = offers[i]['offersize'] - offers[i]['offerremaingquantity'];
                        var serialnum = i + 1;
                        result += '<tr>';
                        result += '<td>'+serialnum+'</td><td>'+offers[i]['productname']+'</td><td>'+offers[i]['productbrand']+'</td>';
                        result += '<td>'+offers[i]['pack']+'</td><td>'+offers[i]['priceoffer']+'</td><td>'+offers[i]['maxlimituser']+' '+offers[i]['maxlimituserunit']+'</td><td>'+offerstartdate+' to '+offerenddate+' </td><td>'+offers[i]['offersize']+' '+offers[i]['offersizeunit']+'</td><td>'+remainingQty+' '+offers[i]['offersizeunit']+'</td><td><a href="/offers/'+offers[i]['_id']+'">Edit</a></td>';
                        result += '</tr>';
                    }
                    $('.all_offer_body').html(result);
                    $('.loader').hide();
                }
            }
        });
    });

    
    $(document).on("click", ".settingsubmit", function(){
        var transportrate = $.trim($('.transportrate').val());
        var refdiscount = $.trim($('.refdiscount').val());
        var offeramout = $.trim($('.orderofferamt').val());
        if(transportrate == '') {
            $('.transportrate').next().show();
            
        }else{
            $('.transportrate').next().hide();
        }
        if(refdiscount == '') {
            $('.refdiscount').next().show();
            
        }else{
            $('.refdiscount').next().hide();
        }
        if(offeramout == '') {
            $('.orderofferamt').next().show();
            
        }else{
            $('.orderofferamt').next().hide();
        }
        if(transportrate == '' || refdiscount == '' || offeramout == ''){
            return false;
        } else {
            $('.loader').show();
            $.ajax({
                type: "POST",
                url: '/settings/othersettings',
                dataType:'json',
                data:
                {
                    transportrate: transportrate,
                    refdiscount: refdiscount,
                    offeramout: offeramout
                },
                success: function(data) {
                    var message = data['message'];
                    if( data['success'] == true ) {
                        $('.settingsuccess strong').html(message);
                        $('.settingsuccess').show();
                        $('.settingfailed').hide();
                        $('.loader').hide();
                    } else {
                        var error = data['errors']['message'];
                        $('.settingfailed strong').html(error);
                        $('.settingfailed').show();
                        $('.settingsuccess').hide();
                        $('.loader').hide();
                    }
                }
            });
        }
    });

    $(document).on("click", ".forgetpasswordsubmit", function(){
        var emailid = $.trim($('.emailaddress').val());
        if(emailid == '') {
            $('.emailaddress').next().show();
            
        }else{
            $('.emailaddress').next().hide();
        }
        
        if( !validateEmail(emailid)) {
            $('.emailerror').show();
        } else {
            $('.emailerror').hide();
        }

        if(emailid == '' || !validateEmail(emailid)){
            return false;
        } else {
            $('.loader').show();
            $.ajax({
                type: "POST",
                url: '/users/forgetpassword',
                dataType:'json',
                data:
                {
                    emailid: emailid,
                    firststep: 'firststep'
                },
                success: function(data) {
                    var message = data['message'];
                    if( data['success'] == true ) {
                        $('.successmessage').html(message);
                        $('.successmessage').show();
                        $('.failedmessage').hide();
                        $('.loader').hide();
                    } else {
                        var error = data['message'];
                        $('.failedmessage').html(error);
                        $('.failedmessage').show();
                        $('.successmessage').hide();
                        $('.loader').hide();
                    }
                }
            });
        }
    });

    $(document).on("click", ".newpasswordsubmit", function(){
        var userid = $.trim($('.userid').val());
        var newpassword = $.trim($('.forgetnewpassword').val());
        if(newpassword == '') {
            $('.forgetnewpassword').next().show();
            
        }else{
            $('.forgetnewpassword').next().hide();
        }

        if(newpassword.length <= 6) {
            $('.passlengtherror').show();
            
        }else{
            $('.passlengtherror').hide();
        }
    
        if(newpassword == '' || newpassword.length <= 6){
            return false;
        } else {
            $('.loader').show();
            $.ajax({
                type: "POST",
                url: '/users/forgetpassword',
                dataType:'json',
                data:
                {
                    userid: userid,
                    newpassword: newpassword,
                    secondstep: 'secondstep'
                },
                success: function(data) {
                    var message = data['message'];
                    if( data['success'] == true ) {
                        alert('success true');
                        $('.successmessage').html(message);
                        $('.successmessage').show();
                        $('.failedmessage').hide();
                        $('.loader').hide();
                        setTimeout(function(){ window.location.href = '/users/login'; }, 4000);
                    } else {
                        var error = data['message'];
                        $('.failedmessage').html(error);
                        $('.failedmessage').show();
                        $('.successmessage').hide();
                        $('.loader').hide();
                        setTimeout(function(){ window.location.href = '/users/login'; }, 4000);
                    }
                }
            });
        }
    });

    $("#changepassword_submit").on( "submit", function() {
        var newpassword = $.trim($('.newpassword').val());
        var oldpassword = $.trim($('.oldpassword').val());
        var phonenumber = $.trim($('.phonenumber').val());
        if(newpassword == '') {
            $('.newpassword').next().show();
            
        }else{
            $('.newpassword').next().hide();
        }

        if(newpassword.length <= 6) {
            $('.passlengtherror').show();
            
        }else{
            $('.passlengtherror').hide();
        }

        if(oldpassword == '') {
            $('.oldpassword').next().show();
            
        }else{
            $('.oldpassword').next().hide();
        }
        if(newpassword == '' || oldpassword == '' || newpassword.length <= 6 ){
            return false;
        } else {
            return true;
        }
    });
    
    $(document).on("click", ".inner-add-btn", function(){
        var main_loop_id  = $(this).attr('data-repeater-create');
        console.log('main id'+main_loop_id);
        var res = 0;
        $( ".brand_variation_row-"+main_loop_id ).each(function( i, val ) {
            res++;
        });
        console.log('res value'+res);
        $("#brand_variation_wrapper-"+main_loop_id).append('<div class="edit_product_variation_row"><div class="brand_variation_row-'+main_loop_id+' " id="variation-row-'+main_loop_id+'-'+res+'"><div class="col-md-3 brand_pack_value"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation]['+res+'][packvalue]" value="" placeholder="Pack Weight" type="number"></div><div class="col-md-3 brand_totpack"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation]['+res+'][totpack]" value="" placeholder="Tot Pack" type="number"></div><div class="col-md-3 brand_inner-pack"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation]['+res+'][innerpack]" value="" placeholder="Inner Pack" type="number"></div><div class="col-md-3 brand_pack-charges"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation]['+res+'][packcharges]" value="" placeholder="Pack Charges" type="number"></div><input data-repeater-delete="inner-field-'+main_loop_id+'-'+res+'" data-brand-index="'+main_loop_id+'" type="button" value="Delete" class="inner-delete-btn btn btn-danger"></div></div>');
    });

    $(document).on("click", ".outer-add-btn", function() {
        var parent_id = $('.inner-add-btn:last').prop('id');
        var main_loop_id  = 0;
        $( ".brand_variation_wrapper").each(function( i, val ) {
            main_loop_id++;
        });
        var brands = '<div class="brand_variation_wrapper" id="brand_variation_wrapper-'+main_loop_id+'"><div class="brand_selection_row"><div class="form-group brandsectionselect"><input class="form-control serialnumberclass" type="hidden" name="product_brand_group['+main_loop_id+'][serialnumber]" value=""/><select class="form-control product_brand product_brand_drop-'+main_loop_id+'" name="product_brand_group['+main_loop_id+'][productbrand]">';
        $( ".product_brand_drop-0 option").each(function( i, val ) {
            var value = $(this).val();
            var serialNumber = $(this).attr('data-serialnum');
            brands += '<option value="'+value+'" data-serialnum="'+serialNumber+'">'+value+'</option>';
        });
        brands += '</select><input data-repeater-delete="'+main_loop_id+'" type="button" value="Delete" class="outer-delete-btn btn btn-danger"></div><div id="form-group"><label>Product Image:</label><input class="" name="product_brand_group['+main_loop_id+'][productimage]" type="file"></div></div><div class="clearfix"></div><div class="edit_product_variation_row"><div class="brand_variation_row-'+main_loop_id+' first_row_con" id="variation-row-'+main_loop_id+'-0"><div class="col-md-3 brand_pack_value"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation][0][packvalue]" value="" placeholder="Pack Weight" type="number"></div><div class="col-md-3 brand_totpack"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation][0][totpack]" value="" placeholder="Tot Pack" type="number"></div><div class="col-md-3 brand_inner-pack"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation][0][innerpack]" value="" placeholder="Inner Pack" type="number"></div><div class="col-md-3 brand_pack-charges"><input class="form-control" name="product_brand_group['+main_loop_id+'][brand_pack_variation][0][packcharges]" value="" placeholder="Pack Charges" type="number"></div></div></div></div><input data-repeater-create="'+main_loop_id+'" type="button" value="Add Pack Row" class="inner-add-btn btn btn-primary" id="inner-btn-'+main_loop_id+'">';
        $(".product_brand_variaton").append(brands);
    });

    $(document).on("click", ".change_product_img", function(){
        var index = $(this).attr('data-index');
        $('.product_image_upload-'+index).show();
    });

    $(document).on("click", ".outer-delete-btn", function(){
        var brandIndex = $(this).attr('data-repeater-delete');
        var parent_id = $(this).closest('.brand_variation_wrapper').prop('id');
        $("#"+parent_id).remove();
        $('#inner-btn-'+brandIndex).remove();
    });

    $(document).on('click', '.delete-broker', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
        type:'DELETE',
        url: '/brokers/'+id,
        success: function(response) {
            alert('Deleting Broker');
            $('.loader').hide();
            window.location.href='/brokers/all';
        },
        error: function(err){
            console.log(err);
        }
        });
    });

    $(document).on('click', '.delete-product', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
        type:'DELETE',
        url: '/products/'+id,
        success: function(response){
            $('.loader').hide();
            alert('Product Deleted Successfully');
            window.location.href='/products/all';
        },
        error: function(err){
            console.log(err);
        }
        });
    });

    $(document).on('click', '.delete-orders', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
        type:'DELETE',
        url: '/orders/'+id,
        success: function(response){
            alert('Deleting Order');
            $('.loader').hide();
            window.location.href='/orders/all';
        },
        error: function(err){
            console.log(err);
        }
        });
    });

    $(document).on('click', '.delete-offers', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
        type:'DELETE',
        url: '/offers/'+id,
        success: function(response){
            alert('Deleting Offer');
            $('.loader').hide();
            window.location.href='/offers/all';
        },
        error: function(err){
            console.log(err);
        }
        });
    });

    $(document).on('click', '.delete-brand', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/brands/'+id,
            success: function(response) {
                alert('Deleting Brand');
                $('.loader').hide();
                window.location.href='/brands/all';
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $(document).on('click', '.product_name_change', function(){
        $('.offer_product_name').hide();
        $('#offerproductname').show();
    });

    $("#addproductform").on( "submit", function(e) {
        $('.product_brand').each(function(){
            var selected = $(this).find('option:selected').attr('data-serialnum');
            $(this).siblings('.serialnumberclass').val(selected);
        });
        var title = $.trim($('#producttitle').val());
        var serialNumber = $.trim($('#sku').val());
        var productUnit = $.trim($('#unit').val());
        if(title== '') {
            $('#producttitle').next().show();
            
        }else{
            $('#producttitle').next().hide();
        }

        if(serialNumber== '') {
            $('#sku').next().show();
            
        }else{
            $('#sku').next().hide();
        }

        if(productUnit== '') {
            $('#unit').next().show();
        }else{
            $('#unit').next().hide();
        }
        
        if(title == '' || serialNumber == '' || productUnit == ''){
            return false;
        }
        e.preventDefault();
        $(this).ajaxSubmit({
            data: {title: title},
            contentType: 'application/json',
            success: function(response){
                console.log(response);
                if(response['success'] == true) {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    $('.productsuccess').html(response['message']);
                    $('.productsuccess').show();
                    $('.productdanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/products/all'; }, 3000);
                } else {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    if(response['serialerror']) {
                        $('.productdanger').html(response['serialerror']);
                    } else {
                        $('.productdanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.productdanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.productdanger').show();
                    $('.productsuccess').hide();
                }   
            }
        });
        return false;
    });

    $("#addbrandform").on( "submit", function(e) {
        var brandTitle = $.trim($('.brandtitle').val());
        var brandDescription = $.trim($('.branddescripiton').val());
        var brandSerialNumber = $.trim($('.brandserialnumber').val());
        if(brandTitle == '') {
            $('.brandtitle').next().show();
            
        }else{
            $('.brandtitle').next().hide();
        }

        if(brandDescription == '') {
            $('.branddescripiton').next().show();
            
        }else{
            $('.branddescripiton').next().hide();
        }

        if(brandSerialNumber == '') {
            $('.brandserialnumber').next().show();
            
        }else{
            $('.brandserialnumber').next().hide();
        }

        if(brandTitle == '' || brandSerialNumber == '' || brandDescription == ''){
            return false;
        }
        e.preventDefault();
        $('.loader').show();
        $(this).ajaxSubmit({
            data: {brandTitle: brandTitle, brandSerialNumber: brandSerialNumber, brandDescription: brandDescription},
            contentType: 'application/json',
            success: function(response){
                console.log(response);
                if(response['success'] == true) {
                    $('.brandsuccess').html(response['message']);
                    $('.brandsuccess').show();
                    $('.branddanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/brands/all'; }, 5000);
                } else {
                    if(response['serialerror']) {
                        $('.branddanger').html(response['serialerror']);
                    } else {
                        $('.branddanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.branddanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.branddanger').show();
                    $('.brandsuccess').hide();
                }   
            }
        });
        return false;
    });

    $(document).on('click', '.edit_brand_btn', function(){
        var brandid = $(this).attr('data-id');
        $('.loader').show();
        $.ajax({
            type:'GET',
            url: '/brands/'+brandid,
            dataType:'json',
            success: function(response) {
                if(response['success'] == true) {
                    var brandserialnumber = response['brand'].brandserialnumber;
                    var brandid = response['brand']._id;
                    var brandtitle = response['brand'].brandtitle;
                    var branddescription = response['brand'].branddescription;
                    var filepath = response['brand'].filepath;
                    $('.editbrandname').val(brandtitle);
                    $('.editbranddescription').val(branddescription);
                    $('.editbrandserialnumber').val(brandserialnumber);
                    $('.edit_filename').val(filepath);
                    $('.edit_brand_img').attr("src",filepath);
                    $('#edit_brand_form').show();
                    $('#addbrandform').hide();
                    $("#edit_brand_form").attr("action", "/brands/edit/" + brandid);
                } else {
                    $('.branddanger').html(response['message']);
                    $('.branddanger').show();
                    $('.brandsuccess').hide();
                }
                $('.loader').hide();
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $("#edit_brand_form").on( "submit", function(e) {
        var editbrandTitle = $.trim($('.editbrandname').val());
        var editbrandDescription = $.trim($('.editbranddescription').val());
        var editbrandSerialNumber = $.trim($('.editbrandserialnumber').val());
        if(editbrandTitle == '') {
            $('.editbrandname').next().show();
            
        }else{
            $('.editbrandname').next().hide();
        }

        if(editbrandDescription == '') {
            $('.editbranddescription').next().show();
            
        }else{
            $('.editbranddescription').next().hide();
        }

        if(editbrandSerialNumber == '') {
            $('.editbrandserialnumber').next().show();
            
        }else{
            $('.editbrandserialnumber').next().hide();
        }

        if(editbrandTitle == '' || editbrandSerialNumber == '' || editbrandDescription == ''){
            return false;
        }
        e.preventDefault();
        $('.loader').show();
        $(this).ajaxSubmit({
            data: {editbrandTitle: editbrandTitle, editbrandSerialNumber: editbrandSerialNumber, editbrandDescription: editbrandDescription},
            contentType: 'application/json',
            success: function(response){
                console.log(response);
                if(response['success'] == true) {
                    $('.brandsuccess').html(response['message']);
                    $('.brandsuccess').show();
                    $('.branddanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/brands/all'; }, 5000);
                } else {
                    if(response['serialerror']) {
                        $('.branddanger').html(response['serialerror']);
                    } else {
                        $('.branddanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.branddanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.branddanger').show();
                    $('.brandsuccess').hide();
                    $('.loader').hide();
                }
                    
            }
        });
        return false;
    });

    $(".btnaddbroker").on( "click", function() {
        var role =  $.trim($(".adduserrole option").filter(":selected").val());
        var name = $.trim($('.addusername').val());
        var phonenumber = $.trim($('.adduserphone').val());
        var accountnumber = $.trim($('.adduseraccountnumber').val());
        var emailid = $.trim($('.adduseremail').val());
        var station = $.trim($('.adduserstation').val());
        if(role == '') {
            $('.adduserrole').next().show();
        }else{
            $('.adduserrole').next().hide();
        }

        if(name == '') {
            $('.addusername').next().show();
            
        }else{
            $('.addusername').next().hide();
        }

        if(phonenumber == '') {
            $('.adduserphone').next().show();
            
        }else{
            $('.adduserphone').next().hide();
        }

        if(emailid == '') {
            $('.adduseremail').next().show();
            
        }else{
            $('.adduseremail').next().hide();
        }

        if( !validateEmail(emailid)) {
            $('.emailerror').show();
        } else {
            $('.emailerror').hide();
        }

        if(role == '' || name == '' || phonenumber == '' || emailid == '' || !validateEmail(emailid)){
            return false;
        }
        $('.loader').show();
        $.ajax({
            type: "POST",
			url: '/brokers/add',
			dataType:'json',
            data:
            {
                name: name,
                email: emailid,
                phonenumber: phonenumber,
                accountnumber: accountnumber,
                station: station,
                role: role
            },
            success: function(response) {
                if(response['success'] == true) {
                    $('.brokersuccess').html(response['message']);
                    $('.brokersuccess').show();
                    $('.brokerdanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/brokers/all'; }, 5000);
                } else {
                    if(response['serialerror']) {
                        $('.brokerdanger').html(response['serialerror']);
                    } else {
                        $('.brokerdanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.brokerdanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.brokerdanger').show();
                    $('.brokersuccess').hide();
                    $('.loader').hide();
                }
            }
        });
    });

    $(document).on('click', '.edit_broker_btn', function(){
        var brokerid = $(this).attr('data-id');
        $('.loader').show();
        $.ajax({
            type:'GET',
            url: '/brokers/'+brokerid,
            dataType:'json',
            success: function(response) {
                if(response['success'] == true) {
                    var email = response['broker'].email;
                    var name = response['broker'].name;
                    var phonenumber = response['broker'].phonenumber;
                    var role = response['broker'].role;
                    var status = response['broker'].status;
                    var accountnumber = response['broker'].accountnumber;
                    var station = response['broker'].station;
                    $('.editusername').val(name);
                    $('.edituseremail').val(email);
                    $('.edituserphone').val(phonenumber);
                    $('.edituserstation').val(station);
                    $('.edituseraccount').val(accountnumber);
                    $(".edituserrole").val(role);
                    $(".edituserstauts").val(status);
                    $('#brokereditform').show();
                    $('#addbrokerform').hide();
                    $("#brokereditform").attr("action", "/brokers/edit/" + brokerid);
                } else {
                    $('.brokerdanger').html(response['message']);
                    $('.brokerdanger').show();
                    $('.brokersuccess').hide();
                }
                $('.loader').hide();
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    $(document).on('click', '.editbrokerbtn', function(){
        var url = $("#brokereditform").attr("action");
        var editrole =  $.trim($(".edituserrole option").filter(":selected").val());
        var editname = $.trim($('.editusername').val());
        var editphonenumber = $.trim($('.edituserphone').val());
        var editemailid = $.trim($('.edituseremail').val());
       
        if(editrole == '') {
            $('.edituserrole').next().show();
        }else{
            $('.edituserrole').next().hide();
        }

        if(editname == '') {
            $('.editusername').next().show();
            
        }else{
            $('.editusername').next().hide();
        }

        if(editphonenumber == '') {
            $('.edituserphone').next().show();
            
        }else{
            $('.edituserphone').next().hide();
        }

        if(editemailid == '') {
            $('.edituseremail').next().show();
            
        }else{
            $('.edituseremail').next().hide();
        }

        if( !validateEmail(editemailid)) {
            $('.emailerror').show();
        } else {
            $('.emailerror').hide();
        }

        if(editrole == '' || editname == '' || editphonenumber == '' || editemailid == '' || !validateEmail(editemailid)){
            return false;
        }
        $('.loader').show();
        var formdata = $('#brokereditform').serialize();
        jQuery.ajax({
            type: "POST",
            url: url,
            data: formdata,
            cache: false,
            success: function (response) {
                console.log(response);
                if(response['success'] == true) {
                    $('.brokersuccess').html(response['message']);
                    $('.brokersuccess').show();
                    $('.brokerdanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/brokers/all'; }, 5000);
                } else {
                    if(response['serialerror']) {
                        $('.brokerdanger').html(response['serialerror']);
                    } else {
                        $('.brokerdanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.brokerdanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.brokerdanger').show();
                    $('.brokersuccess').hide();
                    $('.loader').hide();
                }
            },
            error: function (error) {
                jQuery(".my_form_error").html(error);
                jQuery(".my_form_error").css("display","block");
            }
		});
    });

    $(document).on('click', '.edit_product_btn', function(){
        var productid = $(this).attr('data-id');
        $('.loader').show();
        $.ajax({
            type:'GET',
            url: '/products/'+productid,
            dataType:'json',
            success: function(response) {
                console.log(response);
                if(response['success'] == true) {
                    var brands = response['brands'];
                    var productbrand = response['product'].productbrand;
                    var producttitle = response['product'].producttitle;
                    var sku = response['product'].sku;
                    var description = response['product'].productbody;
                    var unit = response['product'].unit;
                    $('.edit_sku').val(sku);
                    $('.edit_title').val(producttitle);
                    $('.editdescription').val(description);
                    $('.editunit').val(unit);
                    $('.product_brand_variaton').html(" ");
                    var html;
                    for (let index = 0; index < productbrand.length; index++) {
                        console.log(productbrand[index]);
                        var brandvariation = productbrand[index].brand_pack_variation;
                        html = '<div class="brand_variation_wrapper" id="brand_variation_wrapper-'+index+'">';
                            html += '<div class="brand_selection_row"><div class="form-group brandsectionselect"><label>Product Brand :</label>';
                                html += '<input class="form-control editserialnumberclass" type="hidden" name="product_brand_group['+index+'][serialnumber]" value="'+productbrand[index].serialnumber+'}}"/>';
                                html += ' <select class="form-control product_brand_drop-'+index+' edit_product_brand" name="product_brand_group['+index+'][productbrand]">';
                                for (let j = 0; j < brands.length; j++) {
                                    
                                    html += '<option value="'+brands[j].brandtitle+'" data-serialnum="'+brands[j].brandserialnumber+'" ';
                                    if(brands[j].brandtitle == productbrand[index].productbrand) {
                                        html += 'selected=""'; 
                                    }
                                    html += '>'+brands[j].brandtitle+'</option>';
                                }
                                html += '</select>';
                                if(index != 0) {
                                    html += '<input data-repeater-delete="'+index+'" type="button" value="Delete" class="outer-delete-btn btn btn-danger">';
                                }
                            html += '</div><div class="product_image_preview_section">';
                            if(productbrand[index].filepath) {
                                html += '<div class="col-md-10"><label>Product Image:</label><div class="product_image"><img src="'+productbrand[index].filepath+'"/></div></div<div class="col-md-2"><button type="button" data-index="'+index+'" class="change_product_img btn btn-default">Change Image</button></div>';
                            } 
                            html += '</div><div id="form-group" class="product_image_upload-'+index+' ';
                            if(productbrand[index].filepath) {
                                html += 'upload_hide';
                            }
                            html += '"><label>Product Image:</label><input class="" name="product_brand_group['+index+'][productimage]" type="file"><input type="hidden" name="product_brand_group['+index+'][previousfilename]" value="'+productbrand[index].filepath+'"/><input type="hidden" name="product_brand_group['+index+'][filepath]" value="'+productbrand[index].filepath+'"/><input type="hidden" name="product_brand_group['+index+'][filename]" value="'+productbrand[index].filepath+'"/></div>';
                            html += '</div><div class="clearfix"></div>';
                            for (let k = 0; k < brandvariation.length; k++) {
                                html += '<div class="edit_product_variation_row">';
                                    html += '<div class="brand_variation_row-'+index+' ';
                                    if(k == 0) {
                                        html += 'first_row_con';    
                                    }
                                    html += '" id="variation-row-'+index+'-'+k+'">';
                                    html += '<div class="col-md-3 brand_pack_value"><input name="product_brand_group['+index+'][brand_pack_variation]['+k+'][packvalue]" class="form-control" value="'+brandvariation[k].packvalue+'" placeholder="Pack Weight" type="number"></div><div class="col-md-3 brand_totpack"><input class="form-control" name="product_brand_group['+index+'][brand_pack_variation]['+k+'][totpack]" value="'+brandvariation[k].totpack+'" placeholder="Tot Pack" type="number"></div><div class="col-md-3 brand_inner-pack"><input class="form-control" name="product_brand_group['+index+'][brand_pack_variation]['+k+'][innerpack]" value="'+brandvariation[k].innerpack+'" placeholder="Inner Pack" type="number"></div><div class="col-md-3 brand_pack-charges"><input class="form-control" name="product_brand_group['+index+'][brand_pack_variation]['+k+'][packcharges]" value="'+brandvariation[k].packcharges+'" placeholder="Pack Charges" type="number"></div>';
                                    if(k != 0) {
                                        html += '<input data-repeater-delete="inner-field-'+index+'-'+k+'" data-brand-index="'+index+'" type="button" value="Delete" class="inner-delete-btn btn btn-danger">';    
                                    }
                                    html += '</div>';
                                html += '</div>';
                            }
                            html += '</div><input data-repeater-create="'+index+'" type="button" value="Add Pack Row" class="inner-add-btn btn btn-primary" id="inner-btn-'+index+'">';
                            $('.product_brand_variaton').append(html);
                    }
                    
                    $('#editproductform').show();
                    $('#addproductform').hide();
                    $("#editproductform").attr("action", "/products/edit/" + productid);
                } else {
                    $('.productdanger').html(response['message']);
                    $('.productdanger').show();
                    $('.productsuccess').hide();
                }
                $('.loader').hide();
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
    $("#editproductform").on( "submit", function(e) {
        $('.edit_product_brand').each(function(){
            var selected = $(this).find('option:selected').attr('data-serialnum');
            $(this).siblings('.editserialnumberclass').val(selected);
        });
        var title = $.trim($('#editproducttitle').val());
        var serialNumber = $.trim($('.edit_sku').val());
        var productUnit = $.trim($('#editproductunit').val());
        if(title== '') {
            $('#editproducttitle').next().show();
            
        }else{
            $('#editproducttitle').next().hide();
        }

        if(serialNumber== '') {
            $('#edit_sku').next().show();
            
        }else{
            $('#edit_sku').next().hide();
        }

        if(productUnit== '') {
            $('#editproductunit').next().show();
        }else{
            $('#editproductunit').next().hide();
        }
        
        if(title == '' || serialNumber == '' || productUnit == ''){
            return false;
        }
        e.preventDefault();
        $(this).ajaxSubmit({
            data: {title: title},
            contentType: 'application/json',
            success: function(response){
                console.log(response);
                if(response['success'] == true) {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    $('.productsuccess').html(response['message']);
                    $('.productsuccess').show();
                    $('.productdanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/products/all'; }, 3000);
                } else {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    if(response['serialerror']) {
                        $('.productdanger').html(response['serialerror']);
                    } else {
                        $('.productdanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.productdanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.productdanger').show();
                    $('.productsuccess').hide();
                }   
            }
        });
        return false;
    });
    $(document).on('click', '.addpage', function(){
        var pageTitle =  $.trim($(".pagetitle").val());
        var pageBody = $.trim($(".pagebody").val());
        if(pageTitle == '') {
            $('.pagetitle').next().show();
        }else{
            $('.pagetitle').next().hide();
        }

        if(pageBody == '') {
            $('.pagebody').next().show();
            
        }else{
            $('.pagebody').next().hide();
        }

        if(pageTitle == '' || pageBody == ''){
            return false;
        }
        $('.loader').show();
        var formdata = $('#addpageform').serialize();
        jQuery.ajax({
            type: "POST",
            url: '/pages/add',
            data: formdata,
            cache: false,
            success: function (response) {
                console.log(response);
                if(response['success'] == true) {
                    $('.pagesuccess').html(response['message']);
                    $('.pagesuccess').show();
                    $('.pagedanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/pages/all'; }, 3000);
                } else {
                    if(response['serialerror']) {
                        $('.pagedanger').html(response['serialerror']);
                    } else {
                        $('.pagedanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.pagedanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.pagedanger').show();
                    $('.pagesuccess').hide();
                    $('.loader').hide();
                }
            },
            error: function (error) {
                jQuery(".my_form_error").html(error);
                jQuery(".my_form_error").css("display","block");
            }
		});
    });
    $(document).on('click', '.edit_page_btn', function(){
        var pageid = $(this).attr('data-id');
        $('.loader').show();
        $.ajax({
            type:'GET',
            url: '/pages/'+pageid,
            dataType:'json',
            success: function(response) {
                if(response['success'] == true) {
                    var pageTitle = response['page'].pagetitle;
                    var pageBody = response['page'].pagebody;
                    $('.editpagetitle').val(pageTitle);
                    $('.editpagebody').val(pageBody);
                    $('#edit_page_form').show();
                    $('#addpageform').hide();
                    $("#edit_page_form").attr("action", "/pages/edit/" + pageid);
                } else {
                    $('.pagedanger').html(response['message']);
                    $('.pagedanger').show();
                    $('.pagesuccess').hide();
                }
                $('.loader').hide();
            },
            error: function(err) {
                console.log(err);
            }
        });
    });

    $(document).on('click', '.editpage', function(){
        var url = $("#edit_page_form").attr("action");
        var pageTitle =  $.trim($(".editpagetitle").val());
        var pageBody = $.trim($(".editpagebody").val());
        if(pageTitle == '') {
            $('.editpagetitle').next().show();
        }else{
            $('.editpagetitle').next().hide();
        }

        if(pageBody == '') {
            $('.editpagebody').next().show();
            
        }else{
            $('.editpagebody').next().hide();
        }

        if(pageTitle == '' || pageBody == ''){
            return false;
        }
        $('.loader').show();
        var formdata = $('#edit_page_form').serialize();
        jQuery.ajax({
            type: "POST",
            url: url,
            data: formdata,
            cache: false,
            success: function (response) {
                console.log(response);
                if(response['success'] == true) {
                    $('.pagesuccess').html(response['message']);
                    $('.pagesuccess').show();
                    $('.pagedanger').hide();
                    $('.loader').hide();
                    setTimeout(function(){ window.location.href = '/pages/all'; }, 3000);
                } else {
                    if(response['serialerror']) {
                        $('.pagedanger').html(response['serialerror']);
                    } else {
                        $('.pagedanger').html('');
                        for (let index = 0; index < response['errors'].length; index++) {
                            $('.pagedanger').append('</br> '+response['errors'][index].msg);
                        }
                    }
                    $('.pagedanger').show();
                    $('.pagesuccess').hide();
                    $('.loader').hide();
                }
            },
            error: function (error) {
                jQuery(".my_form_error").html(error);
                jQuery(".my_form_error").css("display","block");
            }
		});
    });

    $(document).on('click', '.delete-page', function(){
        $('.loader').show();
        let id = $(this).attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/pages/'+id,
            success: function(response) {
                alert('Deleting Page');
                $('.loader').hide();
                window.location.href='/pages/all';
            },
            error: function(err) {
                console.log(err);
            }
        });
    });
});