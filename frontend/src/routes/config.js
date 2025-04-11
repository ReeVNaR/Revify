import { lazy } from 'react';

const routes = [
  { path: '/', component: lazy(() => import(/* webpackPrefetch: true */ '../pages/Home')) },
  { path: '/search', component: lazy(() => import(/* webpackPrefetch: true */ '../pages/Search')) },
  { path: '/songs', component: lazy(() => import(/* webpackPrefetch: true */ '../pages/SongsList')) },
  { path: '/songs/:songId', component: lazy(() => import('../pages/SongView')) },
  { path: '/library', component: lazy(() => import('../pages/Library')) },
  { path: '/profile', component: lazy(() => import('../pages/Profile')) },
  { path: '/playlist/:playlistId', component: lazy(() => import('../pages/PlaylistView')) }
];

export const criticalRoutes = ['/', '/search', '/library'];
export default routes;
