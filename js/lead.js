// Sends app sign-ups and consult requests to LeadAR (inbound webhook workflow). No photos are ever sent.
window.EDEN_LEAD_URL = "__LEADAR_WEBHOOK__";
window.sendLead = async function(data){
  const payload = Object.assign({source:"EdenCare 360 App", submitted_at:new Date().toISOString()}, data);
  try{
    if(!/^https:/.test(window.EDEN_LEAD_URL)) throw new Error("no endpoint");
    await fetch(window.EDEN_LEAD_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify(payload)});
    try{localStorage.setItem("eden_member",JSON.stringify({first:payload.first_name||"",at:payload.submitted_at}))}catch(e){}
    return true;
  }catch(e){console.log(e);return false}
};
window.leadFormHTML = function(opts){
  opts=opts||{};
  return `<form class="leadform" onsubmit="event.preventDefault();submitLead(this)">
  <div class="row"><input name="first_name" placeholder="First name" required autocomplete="given-name"><input name="last_name" placeholder="Last name" required autocomplete="family-name"></div>
  <input name="phone" type="tel" placeholder="Mobile number" required autocomplete="tel" pattern="[0-9()+\\-. ]{10,}">
  <input name="email" type="email" placeholder="Email" required autocomplete="email">
  <label class="lbl">Birthday (for your birthday reward)</label>
  <div class="row"><select name="bmonth"><option value="">Month</option>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>`<option value="${i+1}">${m}</option>`).join("")}</select><select name="bday"><option value="">Day</option>${Array.from({length:31},(_,i)=>`<option>${i+1}</option>`).join("")}</select></div>
  <input type="hidden" name="kind" value="${opts.kind||"app_signup"}">
  <input type="hidden" name="details" value="${(opts.details||"").replace(/"/g,"&quot;")}">
  <label class="consent"><input type="checkbox" name="sms_consent" required> <span>Yes, EdenCare 360 may text me offers, reminders and rewards at this number. Msg &amp; data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase.</span></label>
  <p class="fine">Please don't include medical details here. See our privacy policy at edencare360.com/privacy.</p>
  <button class="btn block" type="submit">${opts.cta||"Join and claim my $25"}</button>
  </form>`;
};
window.submitLead = async function(f){
  const d=Object.fromEntries(new FormData(f).entries());
  d.sms_consent = !!f.sms_consent.checked;
  d.birthday = d.bmonth&&d.bday ? `${d.bmonth}/${d.bday}` : "";
  const btn=f.querySelector("button");btn.disabled=true;btn.textContent="Sending…";
  const ok=await sendLead(d);
  f.outerHTML = ok ? `<div class="done"><div style="font-size:34px">🎉</div><b>You're in, ${d.first_name.replace(/</g,"")}!</b><p>${d.kind==="consult_request"?"Dr. Edwards' team will text you to set up your consultation.":"Your $25 welcome credit goes into your Patient Wallet at your first visit. Watch your texts for member-only offers."}</p></div>`
    : `<div class="done"><b>We couldn't send that right now.</b><p>Please call or text us at (541) 203-7533 and we'll get you set up.</p></div>`;
};
