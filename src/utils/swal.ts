import Swal from 'sweetalert2';

type Fn<P extends any[], R> = (...params: P) => R;

export type Options = {
  title: string;
  text: string;
  icon: 'warning' | 'success' | 'question';
};

const swalRemove = <P extends any[], R>(
  fn: Fn<P, R>,
  { title, text, icon }: Options,
  ...params: P
) => Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: 'var(--light-green)',
    cancelButtonColor: 'var(--red)',
    confirmButtonText: 'Sim',
    cancelButtonText: 'Não',
    customClass: {
      popup: 'background-swal',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      fn(...params);
    }
  });

const swalUpTrans = () => Swal.fire({
  title: 'Atualizar Lançamento',
  text: 'Quais lançamentos deseja alterar?',
  icon: 'question',
  input: 'radio',
  showCancelButton: true,
  confirmButtonColor: 'var(--light-green)',
  cancelButtonColor: 'var(--red)',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  inputOptions: {
    false: 'Somente este',
    true: 'Este e os próximos',
  },
  inputValue: 'false',
  inputValidator: (value) => {
    if (!value) return 'Você precisa escolher uma opção';
  },
  customClass: {
    popup: 'background-swal',
  },
});

const toast = Swal.mixin({
  toast: true,
  position: 'center',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

export { swalRemove, toast, swalUpTrans };
