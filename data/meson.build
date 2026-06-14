application_id = 'org.gnome.Colorman'

install_data(
  'org.gnome.Colorman.desktop.in',
  rename: 'org.gnome.Colorman.desktop',
  install_dir: get_option('datadir') / 'applications',
)

desktop_utils = find_program('desktop-file-validate', required: false)
if desktop_utils.found()
  test(
    'Validate desktop file',
    desktop_utils,
    args: [meson.current_source_dir() / 'org.gnome.Colorman.desktop.in'],
  )
endif

install_data(
  'org.gnome.Colorman.metainfo.xml.in',
  rename: 'org.gnome.Colorman.metainfo.xml',
  install_dir: get_option('datadir') / 'metainfo',
)

appstreamcli = find_program('appstreamcli', required: false, disabler: true)
test(
  'Validate appstream file',
  appstreamcli,
  args: [
    'validate',
    '--no-net',
    '--explain',
    meson.current_source_dir() / 'org.gnome.Colorman.metainfo.xml.in',
  ],
)

install_data(
  'org.gnome.Colorman.gschema.xml',
  install_dir: get_option('datadir') / 'glib-2.0' / 'schemas',
)

compile_schemas = find_program('glib-compile-schemas', required: false, disabler: true)
test(
  'Validate schema file',
  compile_schemas,
  args: ['--strict', '--dry-run', meson.current_source_dir()],
)

service_conf = configuration_data()
service_conf.set('bindir', get_option('prefix') / get_option('bindir'))
configure_file(
  input: 'org.gnome.Colorman.service.in',
  output: 'org.gnome.Colorman.service',
  configuration: service_conf,
  install_dir: get_option('datadir') / 'dbus-1' / 'services',
)

install_data(
  '../logo.svg',
  rename: '@0@.svg'.format(application_id),
  install_dir: get_option('datadir') / 'icons' / 'hicolor' / 'scalable' / 'apps',
)

install_data(
  '../build/icons/hicolor/symbolic/apps/@0@-symbolic.svg'.format(application_id),
  install_dir: get_option('datadir') / 'icons' / 'hicolor' / 'symbolic' / 'apps',
)
