export const translations = {
    pt: {
        dashboard: 'Painel',
        feed: 'Mural',
        community: 'Comunidade',
        profile: 'Perfil',
        logout: 'Sair da Conta',

        welcome: 'Olá',
        chooseProduct: 'Escolha qual área de membros você deseja acessar hoje.',
        noProducts: 'Nenhum produto disponível no momento.',
        changeProduct: 'Trocar Produto',
        recentClasses: 'Aulas Recentes',
        noClasses: 'Nenhuma aula disponível para este produto no momento.',
        adminNotPosted: 'O administrador ainda não postou conteúdos aqui.',
        fullScreen: 'Ver em Tela Cheia',
        accessMaterial: 'Acessar Material',

        notices: 'Mural de Avisos',
        latestUpdates: 'Acompanhe as últimas publicações e atualizações do curso.',
        noNotices: 'Ainda não há avisos no mural.',

        communityDesc: 'Veja o que outros alunos estão compartilhando.',
        noComments: 'Ainda não há comentários na comunidade.',

        myProfile: 'Meu Perfil',
        name: 'Nome',
        email: 'E-mail',

        selectProductFirst: 'Por favor, acesse a tela Inicial para selecionar uma área de membros primeiro.'
    },
    en: {
        dashboard: 'Dashboard',
        feed: 'Feed',
        community: 'Community',
        profile: 'Profile',
        logout: 'Logout',

        welcome: 'Hello',
        chooseProduct: 'Choose which member area you want to access today.',
        noProducts: 'No products available at the moment.',
        changeProduct: 'Change Product',
        recentClasses: 'Recent Classes',
        noClasses: 'No classes available for this product at the moment.',
        adminNotPosted: 'The admin has not posted content here yet.',
        fullScreen: 'View in Full Screen',
        accessMaterial: 'Access Material',

        notices: 'Notice Board',
        latestUpdates: 'Follow the latest publications and course updates.',
        noNotices: 'There are no notices on the board yet.',

        communityDesc: 'See what other students are sharing.',
        noComments: 'There are no comments in the community yet.',

        myProfile: 'My Profile',
        name: 'Name',
        email: 'E-mail',

        selectProductFirst: 'Please go to the Home screen to select a member area first.'
    },
    es: {
        dashboard: 'Panel',
        feed: 'Muro',
        community: 'Comunidad',
        profile: 'Perfil',
        logout: 'Cerrar Sesión',

        welcome: 'Hola',
        chooseProduct: 'Elige a qué área de miembros quieres acceder hoy.',
        noProducts: 'No hay productos disponibles en este momento.',
        changeProduct: 'Cambiar Producto',
        recentClasses: 'Clases Recientes',
        noClasses: 'No hay clases disponibles para este producto en este momento.',
        adminNotPosted: 'El administrador aún no ha publicado contenido aquí.',
        fullScreen: 'Ver en Pantalla Completa',
        accessMaterial: 'Acceder al Material',

        notices: 'Muro de Avisos',
        latestUpdates: 'Sigue las últimas publicaciones y actualizaciones del curso.',
        noNotices: 'Aún no hay avisos en el muro.',

        communityDesc: 'Mira lo que otros estudiantes están compartiendo.',
        noComments: 'Aún no hay comentarios en la comunidad.',

        myProfile: 'Mi Perfil',
        name: 'Nombre',
        email: 'Correo Electrónico',

        selectProductFirst: 'Por favor, ve a la pantalla de Inicio para seleccionar un área de miembros primero.'
    }
};

export type LanguageCode = keyof typeof translations;
