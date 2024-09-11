/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const EpisodesController = () => import('#controllers/episodes_controller')

router.get('/', [EpisodesController, 'search'])
router.get('/search', [EpisodesController, 'search'])
router.get('/:id', [EpisodesController, 'show'])
