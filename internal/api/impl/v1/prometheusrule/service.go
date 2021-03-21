// Copyright 2021 Amadeus s.a.s
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package prometheusrule

import (
	"fmt"
	"time"

	"github.com/perses/common/etcd"
	"github.com/perses/perses/internal/api/interface/v1/prometheusrule"
	"github.com/perses/perses/internal/api/shared"
	"github.com/perses/perses/pkg/model/api"
	v1 "github.com/perses/perses/pkg/model/api/v1"
	"github.com/sirupsen/logrus"
)

type service struct {
	prometheusrule.Service
	dao prometheusrule.DAO
}

func NewService(dao prometheusrule.DAO) prometheusrule.Service {
	return &service{
		dao: dao,
	}
}

func (s *service) Create(entity api.Entity) (interface{}, error) {
	if ruleObject, ok := entity.(*v1.PrometheusRule); ok {
		return s.create(ruleObject)
	}
	return nil, fmt.Errorf("%w: wrong entity format, attempting prometheusRule format, received '%T'", shared.BadRequestError, entity)
}

func (s *service) create(entity *v1.PrometheusRule) (*v1.PrometheusRule, error) {
	// you don't need to check that the project exists since once the permission middleware will be in place,
	// it won't be possible to create a resources into a not known project
	// Update the time contains in the entity
	entity.Metadata.CreateNow()
	if err := s.dao.Create(entity); err != nil {
		if etcd.IsKeyConflict(err) {
			logrus.Debugf("unable to create the prometheusRule '%s'. It already exits", entity.Metadata.Name)
			return nil, shared.ConflictError
		}
		logrus.WithError(err).Errorf("unable to perform the creation of the prometheuRule '%s', something wrong with etcd", entity.Metadata.Name)
		return nil, shared.InternalError
	}
	return entity, nil
}

func (s *service) Update(entity api.Entity, parameters shared.Parameters) (interface{}, error) {
	if ruleObject, ok := entity.(*v1.PrometheusRule); ok {
		return s.update(ruleObject, parameters)
	}
	return nil, fmt.Errorf("%w: wrong entity format, attempting prometheusRule format, received '%T'", shared.BadRequestError, entity)
}

func (s *service) update(entity *v1.PrometheusRule, parameters shared.Parameters) (*v1.PrometheusRule, error) {
	if entity.Metadata.Name != parameters.Name {
		logrus.Debugf("name in prometheusRule '%s' and coming from the http request: '%s' doesn't match", entity.Metadata.Name, parameters.Name)
		return nil, fmt.Errorf("%w: metadata.name and the name in the http path request doesn't match", shared.BadRequestError)
	}
	if len(entity.Metadata.Project) == 0 {
		entity.Metadata.Project = parameters.Project
	} else if entity.Metadata.Project != parameters.Project {
		logrus.Debugf("project in prometheusRule '%s' and coming from the http request: '%s' doesn't match", entity.Metadata.Project, parameters.Project)
		return nil, fmt.Errorf("%w: metadata.project and the project name in the http path request doesn't match", shared.BadRequestError)
	}
	// find the previous version of the project
	oldEntity, err := s.Get(parameters)
	if err != nil {
		return nil, err
	}
	oldObject := oldEntity.(*v1.PrometheusRule)
	// update the immutable field of the newEntity with the old one
	entity.Metadata.CreatedAt = oldObject.Metadata.CreatedAt
	// update the field UpdatedAt with the new time
	entity.Metadata.UpdatedAt = time.Now().UTC()
	if err := s.dao.Update(entity); err != nil {
		logrus.WithError(err).Errorf("unable to perform the update of the prometheusRule '%s', something wrong with etcd", entity.Metadata.Name)
		return nil, shared.InternalError
	}
	return entity, nil
}

func (s *service) Delete(parameters shared.Parameters) error {
	if err := s.dao.Delete(parameters.Project, parameters.Name); err != nil {
		if etcd.IsKeyNotFound(err) {
			logrus.Debugf("unable to find the project '%s'", parameters.Name)
			return shared.NotFoundError
		}
		logrus.WithError(err).Errorf("unable to delete the project '%s', something wrong with etcd", parameters.Name)
		return shared.InternalError
	}
	return nil
}

func (s *service) Get(parameters shared.Parameters) (interface{}, error) {
	entity, err := s.dao.Get(parameters.Project, parameters.Name)
	if err != nil {
		if etcd.IsKeyNotFound(err) {
			logrus.Debugf("unable to find the project '%s'", parameters.Name)
			return nil, shared.NotFoundError
		}
		logrus.WithError(err).Errorf("unable to find the previous version of the project '%s', something wrong with etcd", parameters.Name)
		return nil, shared.InternalError
	}
	return entity, nil
}

func (s *service) List(q etcd.Query, _ shared.Parameters) (interface{}, error) {
	return s.dao.List(q)
}
