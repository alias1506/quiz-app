import Swal from 'sweetalert2';

const theme = {
    confirmButton: 'inline-flex justify-center items-center w-[140px] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg border-0 outline-none focus:ring-0 cursor-pointer active:scale-95',
    cancelButton: 'inline-flex justify-center items-center w-[140px] py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm rounded-xl transition-all border-0 outline-none focus:ring-0 cursor-pointer active:scale-95',
    popup: 'rounded-[2rem] p-8 border-none shadow-2xl bg-white max-w-[420px] w-full',
    title: 'text-2xl font-bold text-slate-800 tracking-tight mb-2',
    htmlContainer: 'text-slate-500 text-base leading-relaxed mb-0',
    icon: 'border-none scale-100 my-6 mx-auto',
    actions: 'mt-8 flex justify-center gap-3 w-full'
};

const CustomSwal = Swal.mixin({
    customClass: {
        confirmButton: theme.confirmButton,
        cancelButton: theme.cancelButton,
        popup: theme.popup,
        title: theme.title,
        htmlContainer: theme.htmlContainer,
        icon: theme.icon,
        actions: theme.actions
    },
    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, 0.5)',
    // Removed custom animation classes that were causing persistent elements
    showClass: {
        popup: 'swal2-show'
    },
    hideClass: {
        popup: 'swal2-hide'
    },
    allowOutsideClick: false,
    heightAuto: false
});

export default CustomSwal;
