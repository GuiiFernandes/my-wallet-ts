// export const formatedTransfer = (
//   form: FormTransaction,
//   newTransaction: boolean = true,
//   interval?: Interval,
//   transId?: string,
// ) => {
//   const { installments, period, type, value } = form;

//   const newForm: any = { ...form };

//   delete newForm.accountDestiny;
//   delete newForm.isFixed;

//   const newTransactions: TransactionType[] = [];
//   const againstTransactions: TransactionType[] = [];
//   const transactionId = generateId(transId);
//   if (installments) {
//     const [parcel, totalParcel] = calculateInstallments(period, installments, interval);
//     for (let i = 0; i <= (totalParcel - parcel); i += 1) {
//       const newInstallments = generateInstallments(isFixed, parcel, i, totalParcel);
//       newTransactions.push({
//         ...newForm,
//         id: generateId(newForm.id),
//         transactionId,
//         value: calculateValue(totalParcel, value, i, newTransaction),
//         date: calculateNextDate(form.date, period, i),
//         installments: newInstallments,
//         period: installments === 'U' ? '' : period,
//       });
//     }
//   } else {
//     const formatedTrans = {
//       ...newForm,
//       id: generateId(newForm.id),
//       transactionId,
//       installments: isFixed ? 'F' : 'U' };
//     newTransactions.push(formatedTrans);
//   }
//   if (type === 'Transferência') {
//     const { accountDestiny } = form;
//     const destinyTransactions = newTransactions.map((transaction) => ({
//       ...transaction,
//       id: generateId(newForm.id),
//       transactionId,
//       value: transaction.value,
//       account: accountDestiny,
//     }));
//     againstTransactions.push(...destinyTransactions);
//   }
//   return [newTransactions, againstTransactions];
// };
