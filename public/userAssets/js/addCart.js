function addToCart(productId){
    $.ajax({
        url:'/addToCart',
        method:'post',
        data:{
            id:productId
        },
        success:(response)=>{  
            if(response.success){
                swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Product added to cart',
                showConfirmButton: false,
                timer: 1500,
                });
            }else {
                swal.fire({ 
                position:'center',
                icon: 'warning',
                text: response.message,
                timer: 1500,
                showConfirmButton: false,
                });
            }
        }
    })
}
