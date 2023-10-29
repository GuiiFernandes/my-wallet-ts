import Swal from 'sweetalert2';

type Fn<P extends any[], R> = (...params: P) => R;

export type Options = {
  title: string;
  text: string;
  icon: 'warning' | 'success';
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
  }).then((result) => {
    if (result.isConfirmed) {
      fn(...params);
      Swal.fire({
        title: 'Deletado!',
        text: 'O registro foi deletado com sucesso.',
        icon: 'success',
        confirmButtonColor: 'var(--light-green)',
        confirmButtonText: 'Ok',
      });
    }
  });

export { swalRemove };
