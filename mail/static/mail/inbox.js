console.log("hello Lami");

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');


});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  const div_isactive = document.querySelectorAll('.div_toggle');

    // checks if div is DOM and update state to none
  if (div_isactive !== null){
      div_isactive.forEach(msg => msg.remove());
  }
 



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

 
}



const is_read = (id) => {
  fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})
}


const reply_email = (email) => {

  let re_check = ('Re:' === email.subject.slice(0, 3));


  console.log(re_check)
  console.log(email);
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  const div_isactive = document.querySelectorAll('.div_toggle');

    // checks if div is DOM and update state to none
  if (div_isactive !== null){
    div_isactive.forEach(msg => msg.remove());
  }



  // prefills composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = re_check ? email.subject : 'Re: ' + email.subject;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:${email.body} \n`;


}


function open_email(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  let email_box = document.createElement('div');
  email_box.classList.add("div_toggle");
  // email_box.innerHTML = "Hello";

  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);
    // ... do something else with email ...

    const message = document.createElement('div');
    const replyBtn = document.createElement('button');
    const hrBar = document.createElement('hr'); 
    const body = document.createElement('p');
    replyBtn.classList.add('btn','btn-sm', 'btn-outline-primary');

    message.innerHTML = `<p><strong>From:</strong> ${email.sender} </br> <strong>To:</strong> ${email.recipients[0]
} </br> <strong>Subject:</strong> ${email.subject} </br> <strong>Timestamp:</strong> ${email.timestamp}</p>`
    replyBtn.innerHTML = 'Reply'
    body.innerHTML = email.body;
    email_box.appendChild(message);
    email_box.appendChild(replyBtn);
    email_box.appendChild(hrBar);
    email_box.appendChild(body);
    document.querySelector('.container').appendChild(email_box);
    replyBtn.addEventListener('click', () => reply_email(email));

});
}

function archive_mail(id, bol, addr){
  fetch(`/emails/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: !(bol)
  })
  
}).then(() => load_mailbox(addr));
  
}

function view_emails(mail){

    fetch(`/emails/${mail}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        // console.log(emails);
        emails.forEach(msg => {
          //  container for emails
          const container = document.createElement('div')
           const box =  document.createElement('div');
           const archive_btn = document.createElement('button');

           console.log(msg)
          // creating box style 
          box.innerHTML= `<span style="float:left; font-weight:700;">${msg.sender} </span>` + '  ' + `<span style="margin:2em  1em;"> ${msg.subject} </span>`  + `<span style="float:right;font-weight:normal;color:#808080;"> ${msg.timestamp}</span>`
          box.id = msg.id;
       


          box.classList.add("box_format", 'container');

          box.style.padding = "auto";
          box.style.margin = ".2em .5em";
          box.style.border = "thick solid #000";
          
          // if email is read shows shows grey background
          if (msg.read){
            box.style.backgroundColor = 'darkgrey';
            box.style.color = '#000';
          }
          else{
            box.style.backgroundColor = '#fff';
          }

  
        const email_id = Number(msg.id)
        box.addEventListener('click', function() {
          // sets read to true

          is_read(email_id);

          console.log(`${email_id} `+ 'of this element has been clicked!')

          // open email in new view
          open_email(email_id);

});
           archive_btn.classList.add('btn','btn-sm', 'btn-outline-primary');
           container.classList.add('container-sm')
           container.appendChild(box);     
           container.appendChild(archive_btn);
           archive_btn.addEventListener('click', () => archive_mail(msg.id, msg.archived, mail));

          // shows archive button text 
          if (mail === "inbox") {
            archive_btn.innerHTML = 'archive';
            
          }
          else if (mail === "archive") {
            archive_btn.innerHTML = 'unarchive';
          }

          // remove btn from DOM 
          else {
            
            archive_btn.remove();
          }

        
        document.querySelector('#emails-view').appendChild(container);
        }
        


          );
});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  const div_isactive = document.querySelectorAll('.div_toggle');

  // checks if div is DOM and update removes element
  if (div_isactive !== null){
    console.log(div_isactive);
    div_isactive.forEach(msg => msg.remove());

  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show all emails
  view_emails(mailbox); 
} 


function send_email(event){
   event.preventDefault()
  // sends a POST request to the /emails route
  let recipients = document.querySelector('#compose-recipients').value
  let subject = document.querySelector('#compose-subject').value
  let body =  document.querySelector('#compose-body').value
  console.log(recipients, subject, body)

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      return load_mailbox('sent');

    
      
  });

  return 

}



