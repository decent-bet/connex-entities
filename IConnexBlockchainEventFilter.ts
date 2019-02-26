export interface IConnexBlockchainEventFilter {
  interval?: number | null;
  kind?: 'event' | 'transfer';
}
