'use strict';
// Only show loading during a real navigation triggered by submitting the form.
// Never imply missing historical data is still being fetched.
document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('[data-prediction-form]');
  const loading=document.querySelector('[data-prediction-loading]');
  const results=document.querySelector('[data-prediction-results]');
  if(!form||!loading||!results)return;
  form.addEventListener('submit',()=>{
    if(!form.checkValidity())return;
    loading.hidden=false;results.hidden=true;
    const button=form.querySelector('button[type="submit"]');
    if(button)button.textContent='Memuat data…';
  });
  // If the browser restores an earlier page from history, clear stale loading.
  window.addEventListener('pageshow',()=>{loading.hidden=true;results.hidden=false;const button=form.querySelector('button[type="submit"]');if(button)button.textContent='Analisis Data';});
});
