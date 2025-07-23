// Service Worker 등록을 위한 유틸리티 함수

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    // Production 빌드이고 브라우저가 서비스 워커를 지원하는 경우
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URL이 다른 origin에 있으면 작동하지 않음
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // 로컬호스트에서 실행 중인지 확인
        checkValidServiceWorker(swUrl, config);

        // 추가 로깅
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '이 웹 앱은 service worker에 의해 캐시 우선으로 제공됩니다. ' +
              '자세한 내용은 https://cra.link/PWA 를 참고하세요.'
          );
        });
      } else {
        // 로컬호스트가 아니면 서비스 워커 등록
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 이 시점에서 업데이트된 사전 캐시된 콘텐츠가 페치되었지만
              // 이전 서비스 워커가 여전히 이전 콘텐츠를 제공합니다.
              // 모든 클라이언트 탭이 닫힐 때까지.
              console.log(
                '새로운 콘텐츠를 사용할 수 있습니다. 모든 탭을 닫은 후 새로고침하세요.'
              );

              // 콜백 실행
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // 이 시점에서 모든 것이 사전 캐시되었습니다.
              // "콘텐츠가 오프라인 사용을 위해 캐시되었습니다." 메시지를 표시하기에 완벽한 시간입니다.
              console.log('콘텐츠가 오프라인 사용을 위해 캐시되었습니다.');

              // 콜백 실행
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('서비스 워커 등록 중 오류:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // 서비스 워커를 찾을 수 있는지 확인합니다. 찾을 수 없으면 페이지를 새로고침합니다.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // 서비스 워커가 존재하고 JS 파일을 받고 있는지 확인
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // 서비스 워커를 찾을 수 없습니다. 아마도 다른 앱입니다. 페이지를 새로고침합니다.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // 서비스 워커를 찾았습니다. 정상적으로 진행합니다.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('인터넷 연결을 찾을 수 없습니다. 앱이 오프라인 모드에서 실행 중입니다.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}