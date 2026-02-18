import {retrieveJobs} from "./postJobClient.js";

const jobs = []
retrieveJobs()

class MyCard extends HTMLElement{
    constructor(){
        super();
        
        const cardTemplate = document.querySelector("#card");
        const title = this.getAttribute("job-title");
        const desc = this.getAttribute("job-desc");
        const duration = this.getAttribute("job-duration");
        const payment = this.getAttribute("job-payment");
        const contract = this.getAttribute("job-contract");
        
        //const card = cardTemplate.content.cloneNode(true);
        const card = cardTemplate.content.cloneNode(true)

        card.querySelector(".card-title").textContent = title;
        card.querySelector("#job-description").textContent = desc;
        card.querySelector("#job-length").textContent = duration;
        card.querySelector("#job-base-payment").textContent = `$${payment}`;
        card.querySelector("#job-contract-type").textContent = contract;

        this.appendChild(card);
    }
}
customElements.define("my-card", MyCard);