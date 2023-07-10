function addToWhislist(wishId){
    $.ajax({
        url:'/addToWhislist',
        method:'post',
        data:{
            wishlistId:wishId
        },
        success: (response) => {
            location.reload();
        }
    })
}

function deleteWhislist(deleteId){
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete cart',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete!'
        }).then((result) => {
            if (result.isConfirmed) {
            $.ajax({
                url: '/deleteWhislist',
                data: {
                    deleteId:deleteId,
                },
                method: 'post',
                success: (response) => {
                location.reload();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your item has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                },
                error: (error) => {
                console.log(error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while deleting the item.',
                    icon: 'error',
                    showConfirmButton: false
                });
                }
            });
        }
    });
}