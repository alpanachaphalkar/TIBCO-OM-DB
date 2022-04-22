FROM registry.cloud.okteto.net/db-alpanachaphalkar/tibco-base:okteto

COPY configurator $OM_HOME/configurator

RUN chown -R tibuser:tibuser /home/tibuser/ \
	&& chmod -R 755 /home/tibuser \
    && chmod -R a+w $OM_HOME/configurator/standalone/logs \
	&& chmod -R a+w $OM_HOME/configurator/standalone/config \
	&& chmod -R a+w $OM_HOME/configurator/standalone/static/module/externaljs

USER tibuser

ENTRYPOINT ["/home/tibuser/tibco/om/5.1/configurator/standalone/bin/start.sh", "--run=FG"]

EXPOSE 9090
