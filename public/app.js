$(".deletecomment").on("click", function(data){
    let id = data.currentTarget.id
   
    $.ajax({
        url: "/articles/" + id,
        method: "DELETE"
    }).then(function(results){
        console.log(results)
        console.log("success")
    })

})