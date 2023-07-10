function plzlogin() {
    $.ajax({
        success: (response) => {
            swal.fire({
                position: 'top',
                title: '! Please Login To Your Account',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'my-swal-class',
                },
            });
        }
    });
}