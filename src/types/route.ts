export type RouteContext<TParams> = {
  params: TParams | Promise<TParams>;
};
