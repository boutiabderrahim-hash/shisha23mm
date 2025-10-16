
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const triggerCashDrawer = () => {
  const drawerContainer = document.getElementById('cash-drawer-print-container');
  if (drawerContainer) {
    // A single non-breaking space is enough to trigger the print job and open the drawer.
    // The associated print CSS ensures only this div is visible and takes minimal space.
    drawerContainer.innerHTML = '<p style="margin:0; padding:0; font-size:1px;">&nbsp;</p>';
    window.print();
    // Clear the content after the print dialog is triggered to avoid interfering with receipt prints.
    // This timeout runs after the print dialog is closed. A small delay is sufficient.
    setTimeout(() => {
        if(drawerContainer) drawerContainer.innerHTML = '';
    }, 10);
  }
};