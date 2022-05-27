var uid = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {
    
    if(uid === null){
      this.askUid();
    }
    
    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      if(uid !== null){
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askUid:function(){
    var iconUrl = "https://raw.githubusercontent.com/sandeeppunmia/Toy-Store-Icon/main/toys_store.jpg";

    swal({
      title:'Welcome to Curiosity!',
      icon:iconUrl,
      content:{
        element:"input",
        attributes:{
          placeholder:"Type Your UID (Eg:U01)",
          min:1
        }
      },
      closeOnClickOutside:false,
    }).then(inputValue=>{
      uid = inputValue;
    })
  },
  handleMarkerFound: function(toys, markerId) {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";

    var orderButtton = document.getElementById("order-button");
    var orderSummaryButtton = document.getElementById("order-summary-button");

    // Handling Click Events
    orderButtton.addEventListener("click", () => {
      this.handleOrder();
      swal({
        icon: "https://i.imgur.com/4NZ6uLY.jpg",
        title: "Thanks For Order !",
        text: "  ",
        timer: 2000,
        buttons: false
      });
    });

    orderSummaryButtton.addEventListener("click", () => {
      swal({
        icon: "warning",
        title: "Order Summary",
        text: "Work In Progress"
      });
    });

    // Changing Model scale to initial scale
    var toy = toys.filter(toy => toy.id === markerId)[0];

    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("visible",true);

    var description = document.querySelector(`#main-plane-${toy.id}`);
    description.setAttribute("visible",true);

    var pricePlane = document.createElement(`#price-plane-${toy.id}`);
    pricePlane.setAttribute("visible",true);

    if(toy.is_out_of_stock === "true"){
      swal({
        icon:"warning",
        title:toy.toy_name.toUpperCase(),
        text:"The toy is currently out of stock. Please check after some time!",
        timer:2500,
        buttons:false
      })
    } else {
      
    }
  },
  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
  handleOrder:function(uid,toy){
    firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get()
    .then(doc=>{
      var details = doc.data();
      if(details["current_orders"][toy.id]){
        details["current_orders"][toy.id]["quantity"] += 1;
        var currentQuantity = details["current_orders"][toy.id]["quantity"];
        details["current_orders"][toy.id]["subtotal"] = currentQuantity*toy.price;
      } else {
        details["current_orders"][toy.id] = {
          item:toy.toy_name,
          price:toy.price,
          quantity:1,
          subtotal:toy.price * 1
        };
      }

      details.total_bill += toy.price;

      firebase
      .firestore()
      .collection("users")
      .doc(doc.id)
      .update(details);
    })
  }
});
